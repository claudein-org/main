'use client'
import { align, col, gap, row } from "@/css/layout.css"
import { avatar, btn, font, muted, postCard, postCardActions, postImg, postsGrid, preWrap, ytAvatar } from "@/css/style.css"
import { postToInstagram, postToLinkedin, postToYoutube } from "@/server/post"
import type { Channel } from "@/provider/youtube"
import { cx } from "@/styled-system/css"
import { MediaType, Platform, PostType, proto } from "@claudein.org/common"
import { ReactElement, useEffect, useState } from "react"


type Published = Record<string, Record<number, string>>
interface Props {
    payloads: proto.Payloads
    published: Published
    linkedinConnected: boolean
    facebookConnected: boolean
    instagramConnected: boolean
    youtubeConnected: boolean
    youtubeChannels: Channel[]
}

export default function PostsView({ payloads, published, linkedinConnected, facebookConnected, instagramConnected, youtubeConnected, youtubeChannels }: Props) {
    const [links, setLinks] = useState<Published>(published)
    const [posting, setPosting] = useState<Set<string>>(new Set())
    // YouTube uploads tracked per `${hash}:${channel_id}` since the same post can go to several channels.
    const [ytPosted, setYtPosted] = useState<Record<string, string>>({})

    useEffect(() => { setLinks(published) }, [published])

    function trackPosting(key: string) {
        setPosting(prev => new Set(prev).add(key))
        return () => setPosting(prev => { const s = new Set(prev); s.delete(key); return s })
    }

    async function handlePost({ hash, post }: proto.Payload) {
        const done = trackPosting(`${hash}:${Platform.LinkedIn}`)
        try {
            const res = await postToLinkedin({ hash, post })
            if (!res) return
            setLinks(prev => ({ ...prev, [hash]: { ...prev[hash], [Platform.LinkedIn]: res.url } }))
        } finally { done() }
    }

    async function handleInstagramPost({ hash, post }: proto.Payload) {
        const done = trackPosting(`${hash}:${Platform.Instagram}`)
        try {
            const res = await postToInstagram({ hash, post })
            if (!res) return
            setLinks(prev => ({ ...prev, [hash]: { ...prev[hash], [Platform.Instagram]: res.url } }))
        } finally { done() }
    }

    async function handleYoutubePost({ hash, post }: proto.Payload, channel_id: string) {
        const key = `${hash}:${channel_id}`
        const done = trackPosting(key)
        try {
            const res = await postToYoutube({ hash, post }, channel_id)
            if (!res) return
            setYtPosted(prev => ({ ...prev, [key]: res.url }))
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
            return <p className={preWrap}>{text}</p>
        },
        media({ text, media }) {
            return (
                <>
                    {text && <p className={preWrap}>{text}</p>}
                    {showMedia(media)}
                </>
            )
        }
    }

    function poster<T extends PostType>(post: Extract<proto.Post, { type: T }>) {
        return Poster[post.type](post)
    }

    function actions({ hash, post }: proto.Payload) {
        const postLinks = links[hash] ?? {}
        const linkedinLink = postLinks[Platform.LinkedIn]
        const instagramLink = postLinks[Platform.Instagram]
        const youtubeLink = postLinks[Platform.YouTube]
        const isPostingLinkedin = posting.has(`${hash}:${Platform.LinkedIn}`)
        const isPostingInstagram = posting.has(`${hash}:${Platform.Instagram}`)

        return (
            <div className={postCardActions}>
                {linkedinConnected && post.platforms.includes('LinkedIn') && (
                    linkedinLink
                        ? <a href={linkedinLink} target="_blank" rel="noopener noreferrer" className={cx(btn({ color: 'linkedin', size: 'sm' }))}>
                            View on LinkedIn
                        </a>
                        : <button className={btn({ color: 'linkedin', size: 'sm' })} onClick={() => handlePost({ hash, post })} disabled={isPostingLinkedin}>
                            {isPostingLinkedin ? 'Posting…' : 'LinkedIn'}
                        </button>
                )}
                {facebookConnected && post.platforms.includes('Facebook') && (
                    <button className={btn({ color: 'facebook', size: 'sm' })} disabled>
                        Facebook
                    </button>
                )}
                {instagramConnected && post.platforms.includes('Instagram') && (
                    instagramLink
                        ? <a href={instagramLink} target="_blank" rel="noopener noreferrer" className={cx(btn({ color: 'instagram', size: 'sm' }))}>
                            View on Instagram
                        </a>
                        : <button className={btn({ color: 'instagram', size: 'sm' })} onClick={() => handleInstagramPost({ hash, post })} disabled={isPostingInstagram}>
                            {isPostingInstagram ? 'Posting…' : 'Instagram'}
                        </button>
                )}
                {youtubeConnected && post.platforms.includes('YouTube') && youtubeChannels.map((channel) => {
                    const key = `${hash}:${channel.channel_id}`
                    const isPosting = posting.has(key)
                    // Prefer this session's upload; fall back to the stored URL only with a single
                    // channel, since the posts table can't attribute history to a specific channel.
                    const url = ytPosted[key] ?? (youtubeChannels.length === 1 ? youtubeLink : undefined)
                    const label = (
                        <span className={cx(row, align.center, gap.xs)}>
                            <img className={ytAvatar} src={channel.thumbnail} alt="" />
                            <span>{url ? 'View on YouTube' : isPosting ? 'Uploading…' : channel.title}</span>
                        </span>
                    )
                    return url
                        ? <a key={channel.channel_id} href={url} target="_blank" rel="noopener noreferrer" className={cx(btn({ color: 'youtube', size: 'sm' }))} title={channel.title}>
                            {label}
                        </a>
                        : <button key={channel.channel_id} className={btn({ color: 'youtube', size: 'sm' })} onClick={() => handleYoutubePost({ hash, post }, channel.channel_id)} disabled={isPosting} title={channel.title}>
                            {label}
                        </button>
                })}
            </div>
        )
    }

    if (payloads.length === 0) return <div className={muted}>No posts yet — add one to your brand.yml.</div>

    return (
        <div className={postsGrid}>
            {payloads.map((payload) => {
                const { hash, post } = payload
                return (
                    <div key={hash} className={postCard}>
                        <div className={cx(row, align.center, gap.sm)}>
                            <div className={avatar} />
                            <div className={cx(col, gap.xs)}>
                                <span className={font.weight.medium}>You</span>
                                <span className={cx(muted, font.size.sm)}>
                                    {new Date(post.created).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        {poster(post)}
                        {actions(payload)}
                    </div>
                )
            })}
        </div>
    )
}
