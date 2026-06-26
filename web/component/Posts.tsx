'use client'
import { align, col, gap, grow, justify, overflow, row } from "@/css/layout.css"
import { avatar, btn, card, carouselArrow, font, muted, postImg, progressDot, progressDotActive, slideInFromLeft, slideInFromRight } from "@/css/style.css"
import { postToInstagram, postToLinkedin, postToYoutube } from "@/server/post"
import { cx } from "@/styled-system/css"
import { MediaType, PostType, Provider, proto } from "@claudein.org/common"
import { ReactElement, useEffect, useState } from "react"

interface Suitability { linkedin: boolean; facebook: boolean; instagram: boolean; youtube: boolean }

function base64Bytes(b64: string): number {
    const padding = (b64.match(/=/g) || []).length
    return Math.floor(b64.length * 3 / 4) - padding
}

function mediaInfo(base64: string, type: MediaType): Promise<{ width: number; height: number; duration: number }> {
    if (type === 'image') {
        return new Promise(resolve => {
            const img = new Image()
            img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight, duration: 0 })
            img.src = `data:image/*;base64,${base64}`
        })
    }
    return new Promise(resolve => {
        const vid = document.createElement('video')
        vid.onloadedmetadata = () => resolve({ width: vid.videoWidth, height: vid.videoHeight, duration: vid.duration })
        vid.src = `data:video/*;base64,${base64}`
    })
}

function initialSuitability(post: proto.Post): Suitability {
    const hasMedia = post.type === 'media'
    const hasVideo = hasMedia && post.media.type === 'video'
    return { linkedin: true, facebook: true, instagram: hasMedia, youtube: hasVideo }
}

async function computeSuitability(post: proto.Post): Promise<Suitability> {
    if (post.type !== 'media') return initialSuitability(post)

    const { media } = post
    const bytes = base64Bytes(media.base64)
    const { width, height, duration } = await mediaInfo(media.base64, media.type)
    const ratio = width / height

    if (media.type === 'image') {
        return {
            linkedin: bytes <= 20_971_520 && ratio >= 1 / 2.4 && ratio <= 2.4,
            facebook: bytes <= 4_194_304,
            instagram: bytes <= 8_388_608 && ratio >= 0.8 && ratio <= 1.91,
            youtube: false,
        }
    }
    return {
        linkedin: bytes <= 5_368_709_120 && duration >= 3 && duration <= 600,
        facebook: true,
        instagram: bytes <= 681_574_400 && duration >= 3 && duration <= 60,
        youtube: true,
    }
}

type Published = Record<string, Record<number, string>>
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

    const [suitability, setSuitability] = useState<Suitability>({ linkedin: true, facebook: true, instagram: true, youtube: true })

    useEffect(() => {
        const payload = payloads[currentIndex]
        if (!payload) return
        setSuitability(initialSuitability(payload.post))
        computeSuitability(payload.post).then(setSuitability)
    }, [payloads, currentIndex])

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

    function trackPosting(hash: string, provider: number) {
        const key = `${hash}:${provider}`
        setPosting(prev => new Set(prev).add(key))
        return () => setPosting(prev => { const s = new Set(prev); s.delete(key); return s })
    }

    async function handlePost({ hash, post }: proto.Payload) {
        const done = trackPosting(hash, Provider.LinkedIn)
        try {
            const res = await postToLinkedin({ hash, post })
            if (!res) return
            setLinks(prev => ({ ...prev, [hash]: { ...prev[hash], [Provider.LinkedIn]: res.url } }))
        } finally { done() }
    }

    async function handleInstagramPost({ hash, post }: proto.Payload) {
        const done = trackPosting(hash, Provider.Instagram)
        try {
            const res = await postToInstagram({ hash, post })
            if (!res) return
            setLinks(prev => ({ ...prev, [hash]: { ...prev[hash], [Provider.Instagram]: res.url } }))
        } finally { done() }
    }

    async function handleYoutubePost({ hash, post }: proto.Payload) {
        const done = trackPosting(hash, Provider.YouTube)
        try {
            const res = await postToYoutube({ hash, post })
            if (!res) return
            setLinks(prev => ({ ...prev, [hash]: { ...prev[hash], [Provider.YouTube]: res.url } }))
        } finally { done() }
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

    const payload = payloads[currentIndex]
    if (!payload) return null

    const { hash, post } = payload
    const { created } = post
    const postLinks = links[hash] ?? {}
    const linkedinLink = postLinks[Provider.LinkedIn]
    const instagramLink = postLinks[Provider.Instagram]
    const youtubeLink = postLinks[Provider.YouTube]
    const isPostingLinkedin = posting.has(`${hash}:${Provider.LinkedIn}`)
    const isPostingInstagram = posting.has(`${hash}:${Provider.Instagram}`)
    const isPostingYoutube = posting.has(`${hash}:${Provider.YouTube}`)

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
            <div className={cx(row, justify.center, gap.sm)}>
                {linkedinConnected && suitability.linkedin && (
                    linkedinLink
                        ? <a href={linkedinLink} target="_blank" rel="noopener noreferrer" className={cx(btn({ color: 'linkedin', size: 'sm' }))}>
                            View on LinkedIn
                          </a>
                        : <button className={btn({ color: 'linkedin', size: 'sm' })} onClick={() => handlePost({ hash, post })} disabled={isPostingLinkedin}>
                            {isPostingLinkedin ? 'Posting…' : 'LinkedIn'}
                          </button>
                )}
                {facebookConnected && suitability.facebook && (
                    <button className={btn({ color: 'facebook', size: 'sm' })} disabled>
                        Facebook
                    </button>
                )}
                {instagramConnected && suitability.instagram && (
                    instagramLink
                        ? <a href={instagramLink} target="_blank" rel="noopener noreferrer" className={cx(btn({ color: 'instagram', size: 'sm' }))}>
                            View on Instagram
                          </a>
                        : <button className={btn({ color: 'instagram', size: 'sm' })} onClick={() => handleInstagramPost({ hash, post })} disabled={isPostingInstagram}>
                            {isPostingInstagram ? 'Posting…' : 'Instagram'}
                          </button>
                )}
                {youtubeConnected && suitability.youtube && (
                    youtubeLink
                        ? <a href={youtubeLink} target="_blank" rel="noopener noreferrer" className={cx(btn({ color: 'youtube', size: 'sm' }))}>
                            View on YouTube
                          </a>
                        : <button className={btn({ color: 'youtube', size: 'sm' })} onClick={() => handleYoutubePost({ hash, post })} disabled={isPostingYoutube}>
                            {isPostingYoutube ? 'Uploading…' : 'YouTube'}
                          </button>
                )}
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
