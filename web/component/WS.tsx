'use client'
import { align, col, gap, row } from "@/css/layout.css"
import { avatar, btn, card, color, font, muted, postImg } from "@/css/style.css"
import { postToLinkedin } from "@/server/post"
import { cx } from "@/styled-system/css"
import { proto } from "@claudein.org/common"
import { useEffect, useState } from "react"

type Published = { [hash: string]: string }
interface Props {
    published: Published
    port: number
}

export default function WS({ port, published }: Props) {
    const [payloads, setPayloads] = useState<proto.Payloads>([])
    const [links, setLinks] = useState<Published>(published)
    const [posting, setPosting] = useState<Set<string>>(new Set())

    useEffect(() => { setLinks(published) }, [published])

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:${port}`)
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            setPayloads(proto.Payloads.parse(data))
        }
        return () => ws.close()
    }, [port])

    async function handlePost({ hash, post }: proto.Payload) {
        try {
            setPosting(prev => new Set(prev).add(hash))
            const res = await postToLinkedin({ hash, post })
            if (!res) return
            setLinks(prev => ({ ...prev, [hash]: `https://www.linkedin.com/feed/update/${res.urn}` }))
        } finally {
            setPosting(prev => {
                const newSet = new Set(prev)
                newSet.delete(hash)
                return newSet
            })
        }
    }

    return <div className={cx(col, gap.lg)}>
        {payloads.map(({ hash, post }) => {
            const { created, text } = post
            const image = post.type === 'image' ? post.image : undefined
            const link = links[hash]
            const isPosting = posting.has(hash)
            return (
                <div key={hash} className={card}>
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
                            : <button className={btn({ color: 'linkedin' })} onClick={() => handlePost({ hash, post })} disabled={isPosting}>
                                {isPosting ? 'Posting…' : 'Post to LinkedIn'}
                            </button>
                        }
                    </div>
                </div>
            )
        })}
    </div>
}
