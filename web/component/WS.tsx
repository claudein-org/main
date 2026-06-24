'use client'
import { align, col, gap, row } from "@/css/layout.css"
import { avatar, btn, card, color, font, muted, postImg } from "@/css/style.css"
import { postToLinkedin } from "@/server/post"
import { cx } from "@/styled-system/css"
import { MediaType, PostType, proto, yml } from "@claudein.org/common"
import { ReactElement, useEffect, useState } from "react"

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

    const Media: { [key in MediaType]: (media: Extract<yml.Media, { type: key }>) => ReactElement } = {
        image({ base64 }) {
            return <img className={postImg} src={`data:image/*;base64,${base64}`} alt="Post media" />
        },
        video({ base64 }) {
            return <video className={postImg} autoPlay loop muted playsInline>
                <source src={`data:video/*;base64,${base64}`} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        }
    }

    function showMedia<T extends MediaType>(media: Extract<yml.Media, { type: T }>) {
        return Media[media.type](media)
    }

    const Poster: { [key in PostType]: (post: Extract<proto.Post, { type: key }>) => ReactElement } = {
        text({ text }) {
            return <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
        },
        media({ text, media }) {
            return (
                <>
                    <p style={{ whiteSpace: 'pre-wrap' }}>{text}</p>
                    {showMedia(media)}
                </>
            )
        }
    }

    function poster<T extends PostType>(post: Extract<proto.Post, { type: T }>) {
        return Poster[post.type](post)
    }


    return <div className={cx(col, gap.lg)}>
        {payloads.map(({ hash, post }) => {
            const { created, text } = post
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
                    {poster(post)}
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
