'use client'
import { align, col, gap, grow, justify, overflow, row } from "@/css/layout.css"
import { avatar, btn, card, carouselArrow, font, muted, postFooter, postImg, progressDot, progressDotActive, slideInFromLeft, slideInFromRight } from "@/css/style.css"
import { postToLinkedin } from "@/server/post"
import { cx } from "@/styled-system/css"
import { MediaType, PostType, proto } from "@claudein.org/common"
import { ReactElement, useEffect, useState } from "react"

type Published = { [hash: string]: string }
interface Props {
    published: Published
    port: number
    linkedinConnected: boolean
    facebookConnected: boolean
    instagramConnected: boolean
    youtubeConnected: boolean
}

const MAX_DOTS = 20

export default function WS({ port, published, linkedinConnected, facebookConnected, instagramConnected, youtubeConnected }: Props) {
    const [payloads, setPayloads] = useState<proto.Payloads>([])
    const [links, setLinks] = useState<Published>(published)
    const [posting, setPosting] = useState<Set<string>>(new Set())
    const [currentIndex, setCurrentIndex] = useState(0)
    const [direction, setDirection] = useState<'right' | 'left'>('right')

    useEffect(() => { setLinks(published) }, [published])

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:${port}`)
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            setPayloads(proto.Payloads.parse(data))
        }
        return () => ws.close()
    }, [port])

    useEffect(() => {
        setCurrentIndex(prev => Math.min(prev, Math.max(0, payloads.length - 1)))
    }, [payloads.length])

    function navigate(index: number) {
        const clamped = Math.max(0, Math.min(payloads.length - 1, index))
        if (clamped === currentIndex) return
        setDirection(clamped > currentIndex ? 'right' : 'left')
        setCurrentIndex(clamped)
    }

    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
            if (e.key === 'ArrowLeft') { e.preventDefault(); navigate(currentIndex - 1) }
            if (e.key === 'ArrowRight') { e.preventDefault(); navigate(currentIndex + 1) }
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [currentIndex, payloads.length])

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

    const Media: { [key in MediaType]: (media: Extract<proto.Media, { type: key }>) => ReactElement } = {
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

    function showMedia<T extends MediaType>(media: Extract<proto.Media, { type: T }>) {
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

    if (payloads.length === 0) return null

    const { hash, post } = payloads[currentIndex]
    const { created } = post
    const link = links[hash]
    const isPosting = posting.has(hash)

    return (
        <div className={cx(col, gap.md)}>
            <div className={cx(row, align.center, gap.sm)}>
                <button
                    className={carouselArrow}
                    onClick={() => navigate(currentIndex - 1)}
                    disabled={currentIndex === 0}
                    aria-label="Previous post"
                >
                    ←
                </button>
                <div className={cx(col, align.center, grow, overflow.hidden)}>
                    <div key={currentIndex} className={cx(card, direction === 'right' ? slideInFromRight : slideInFromLeft)}>
                        <div className={cx(row, align.center, gap.sm)}>
                            <div className={avatar} />
                            <div className={cx(col, gap.xs)}>
                                <span className={font.weight.medium}>You</span>
                                <span className={cx(muted, font.size.sm)}>
                                    {new Date(created).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        {poster(post)}
                        <div className={postFooter}>
                            {linkedinConnected && (
                                link
                                    ? <a href={link} target="_blank" rel="noopener noreferrer" className={cx(btn({ color: 'linkedin', size: 'sm' }))}>
                                        View on LinkedIn
                                      </a>
                                    : <button className={btn({ color: 'linkedin', size: 'sm' })} onClick={() => handlePost({ hash, post })} disabled={isPosting}>
                                        {isPosting ? 'Posting…' : 'LinkedIn'}
                                      </button>
                            )}
                            {facebookConnected && (
                                <button className={btn({ color: 'facebook', size: 'sm' })} disabled>
                                    Facebook
                                </button>
                            )}
                            {instagramConnected && (
                                <button className={btn({ color: 'instagram', size: 'sm' })} disabled>
                                    Instagram
                                </button>
                            )}
                            {youtubeConnected && (
                                <button className={btn({ color: 'youtube', size: 'sm' })} disabled>
                                    YouTube
                                </button>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    className={carouselArrow}
                    onClick={() => navigate(currentIndex + 1)}
                    disabled={currentIndex === payloads.length - 1}
                    aria-label="Next post"
                >
                    →
                </button>
            </div>
            {payloads.length <= MAX_DOTS ? (
                <div className={cx(row, justify.center, gap.xs)}>
                    {payloads.map((_, i) => (
                        <button
                            key={i}
                            className={cx(progressDot, i === currentIndex ? progressDotActive : '')}
                            onClick={() => navigate(i)}
                            aria-label={`Go to post ${i + 1}`}
                        />
                    ))}
                </div>
            ) : (
                <div className={cx(row, justify.center)}>
                    <span className={cx(muted, font.size.sm)}>{currentIndex + 1} / {payloads.length}</span>
                </div>
            )}
        </div>
    )
}
