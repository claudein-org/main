'use client'
import { proto } from "@claudein.org/common"
import { useEffect, useState } from "react"
import { post } from "@/server/post"
import { cx } from "@/styled-system/css"
import { col, row, align, gap } from "@/css/layout.css"
import { avatar, btn, card, color, font, muted, postImg } from "@/css/style.css"

interface Props {
    published: { [post_id: number]: string }
    port: number
}

export default function WS({ port, published }: Props) {
    const [payload, setPayload] = useState<proto.Payload>()
    const [links, setLinks] = useState<{ [post_id: number]: string }>(published)
    const [posting, setPosting] = useState<{ [post_id: number]: boolean }>({})

    useEffect(() => { setLinks(published) }, [published])

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:${port}`)
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            setPayload(proto.Payload.parse(data))
        }
        return () => ws.close()
    }, [port])

    async function handlePost(p: proto.Post) {
        setPosting(prev => ({ ...prev, [p.post_id]: true }))
        try {
            const url = await post(p)
            if (url) setLinks(prev => ({ ...prev, [p.post_id]: url }))
        } finally {
            setPosting(prev => ({ ...prev, [p.post_id]: false }))
        }
    }

    return <div className={cx(col, gap.lg)}>
        {payload?.posts.map((p) => {
            const { post_id, created, text } = p
            const image = p.type === 'image' ? p.image : undefined
            const link = links[post_id]
            const isPosting = posting[post_id]
            return (
                <div key={post_id} className={card}>
                    <div className={cx(row, align.center, gap.sm)}>
                        <div className={avatar} />
                        <div className={cx(col, gap.xs)}>
                            <span className={font.weight.medium}>LinkedIn User</span>
                            <span className={cx(muted, font.size.sm)}>
                                {new Date(created).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    {text && <p>{text}</p>}
                    {image && <img className={postImg} src={`data:image/*;base64,${image.base64}`} alt={image.src} />}
                    <div>
                        {link
                            ? <a href={link} target="_blank" rel="noopener noreferrer" className={color.linkedin}>
                                View on LinkedIn
                            </a>
                            : <button className={btn({ color: 'linkedin' })} onClick={() => handlePost(p)} disabled={isPosting}>
                                {isPosting ? 'Posting…' : 'Post to LinkedIn'}
                            </button>
                        }
                    </div>
                </div>
            )
        })}
    </div>
}
