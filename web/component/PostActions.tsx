'use client'
import { align, gap, row } from "@/css/layout.css"
import { btn, postCardActions, ytAvatar } from "@/css/style.css"
import { postToDevto, postToInstagram, postToLinkedin, postToYoutube } from "@/server/post"
import type { Channel } from "@/provider/youtube"
import { cx } from "@/styled-system/css"
import { Platform, PlatformSupport, proto } from "@claudein.org/common"
import { useState } from "react"

type Published = Record<string, Record<number, string>>

interface Props {
    payload: proto.Payload
    published: Published
    linkedinConnected: boolean
    facebookConnected: boolean
    instagramConnected: boolean
    youtubeConnected: boolean
    youtubeChannels: Channel[]
    devtoConnected: boolean
}

// Publish buttons shared by post and article cards. Posting state is tracked
// per-card; `published` seeds any links already persisted in the posts table.
export default function PostActions({ payload, published, linkedinConnected, facebookConnected, instagramConnected, youtubeConnected, youtubeChannels, devtoConnected }: Props) {
    const { hash, asset } = payload
    // `published` seeds links already persisted in the posts table; it's a static
    // server prop, so we read it once on mount rather than syncing via effect.
    const [links, setLinks] = useState<Record<number, string>>(published[hash] ?? {})
    const [posting, setPosting] = useState<Set<string>>(new Set())
    // YouTube uploads tracked per `${hash}:${channel_id}` since the same post can go to several channels.
    const [ytPosted, setYtPosted] = useState<Record<string, string>>({})

    function trackPosting(key: string) {
        setPosting(prev => new Set(prev).add(key))
        return () => setPosting(prev => { const s = new Set(prev); s.delete(key); return s })
    }

    async function handlePost() {
        const done = trackPosting(`${hash}:${Platform.LinkedIn}`)
        try {
            const res = await postToLinkedin({ hash, asset })
            if (!res) return
            setLinks(prev => ({ ...prev, [Platform.LinkedIn]: res.url }))
        } finally { done() }
    }

    async function handleInstagramPost() {
        const done = trackPosting(`${hash}:${Platform.Instagram}`)
        try {
            const res = await postToInstagram({ hash, asset })
            if (!res) return
            setLinks(prev => ({ ...prev, [Platform.Instagram]: res.url }))
        } finally { done() }
    }

    async function handleYoutubePost(channel_id: string) {
        const key = `${hash}:${channel_id}`
        const done = trackPosting(key)
        try {
            const res = await postToYoutube({ hash, asset }, channel_id)
            if (!res) return
            setYtPosted(prev => ({ ...prev, [key]: res.url }))
        } finally { done() }
    }

    async function handleDevtoPost() {
        const done = trackPosting(`${hash}:${Platform['DEV.to']}`)
        try {
            const res = await postToDevto({ hash, asset })
            if (!res) return
            setLinks(prev => ({ ...prev, [Platform['DEV.to']]: res.url }))
        } finally { done() }
    }

    const linkedinLink = links[Platform.LinkedIn]
    const instagramLink = links[Platform.Instagram]
    const youtubeLink = links[Platform.YouTube]
    const devtoLink = links[Platform['DEV.to']]
    const isPostingLinkedin = posting.has(`${hash}:${Platform.LinkedIn}`)
    const isPostingInstagram = posting.has(`${hash}:${Platform.Instagram}`)
    const isPostingDevto = posting.has(`${hash}:${Platform['DEV.to']}`)

    return (
        <div className={postCardActions}>
            {linkedinConnected && asset.target.includes('LinkedIn') && PlatformSupport.LinkedIn.includes(asset.type) && (
                linkedinLink
                    ? <a href={linkedinLink} target="_blank" rel="noopener noreferrer" className={cx(btn({ color: 'linkedin', size: 'sm' }))}>
                        View on LinkedIn
                    </a>
                    : <button className={btn({ color: 'linkedin', size: 'sm' })} onClick={handlePost} disabled={isPostingLinkedin}>
                        {isPostingLinkedin ? 'Posting…' : 'LinkedIn'}
                    </button>
            )}
            {facebookConnected && asset.target.includes('Facebook') && PlatformSupport.Facebook.includes(asset.type) && (
                <button className={btn({ color: 'facebook', size: 'sm' })} disabled>
                    Facebook
                </button>
            )}
            {instagramConnected && asset.target.includes('Instagram') && PlatformSupport.Instagram.includes(asset.type) && (
                instagramLink
                    ? <a href={instagramLink} target="_blank" rel="noopener noreferrer" className={cx(btn({ color: 'instagram', size: 'sm' }))}>
                        View on Instagram
                    </a>
                    : <button className={btn({ color: 'instagram', size: 'sm' })} onClick={handleInstagramPost} disabled={isPostingInstagram}>
                        {isPostingInstagram ? 'Posting…' : 'Instagram'}
                    </button>
            )}
            {devtoConnected && asset.target.includes('DEV.to') && PlatformSupport['DEV.to'].includes(asset.type) && (
                devtoLink
                    ? <a href={devtoLink} target="_blank" rel="noopener noreferrer" className={cx(btn({ color: 'devto', size: 'sm' }))}>
                        View on dev.to
                    </a>
                    : <button className={btn({ color: 'devto', size: 'sm' })} onClick={handleDevtoPost} disabled={isPostingDevto}>
                        {isPostingDevto ? 'Posting…' : 'dev.to'}
                    </button>
            )}
            {youtubeConnected && asset.target.includes('YouTube') && PlatformSupport.YouTube.includes(asset.type) && youtubeChannels.map((channel) => {
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
                    : <button key={channel.channel_id} className={btn({ color: 'youtube', size: 'sm' })} onClick={() => handleYoutubePost(channel.channel_id)} disabled={isPosting} title={channel.title}>
                        {label}
                    </button>
            })}
        </div>
    )
}
