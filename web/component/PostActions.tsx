'use client'
import { align, gap, row } from "@/css/layout.css"
import { btn, postCardActions, ytAvatar } from "@/css/style.css"
import { postToDevto, postToFacebook, postToInstagram, postToLinkedin, postToYoutube } from "@/server/post"
import type { Page } from "@/provider/facebook"
import type { Account } from "@/provider/instagram"
import type { Channel } from "@/provider/youtube"
import { cx } from "@/styled-system/css"
import { Platform, PlatformSupport, proto } from "@claudein.org/common"
import { useState } from "react"

type Published = Record<string, Record<number, Record<string, string>>>

interface Props {
    payload: proto.Payload
    published: Published
    linkedinConnected: boolean
    facebookPages: Page[]
    instagramAccounts: Account[]
    youtubeConnected: boolean
    youtubeChannels: Channel[]
    devtoConnected: boolean
}

// Publish buttons shared by post and article cards. Posting state is tracked
// per-card; `published` seeds any links already persisted in the posts table.
export default function PostActions({ payload, published, linkedinConnected, facebookPages, instagramAccounts, youtubeConnected, youtubeChannels, devtoConnected }: Props) {
    const { hash, asset } = payload
    // Links already persisted in the posts table, keyed provider -> account_id.
    // It's a static server prop, so we read it once on mount rather than syncing
    // via effect.
    const accounts = published[hash] ?? {}
    // Single-account providers (LinkedIn, dev.to) have one stored URL per provider.
    const firstUrl = (provider: number) => {
        const byAccount = accounts[provider]
        return byAccount && Object.values(byAccount)[0]
    }
    const [links, setLinks] = useState<Record<number, string>>(() => {
        const seed: Record<number, string> = {}
        const li = firstUrl(Platform.LinkedIn)
        if (li) seed[Platform.LinkedIn] = li
        const dt = firstUrl(Platform['DEV.to'])
        if (dt) seed[Platform['DEV.to']] = dt
        return seed
    })
    const [posting, setPosting] = useState<Set<string>>(new Set())
    // Instagram/YouTube/Facebook uploads tracked per `${hash}:${account_id}` since the same post can go to several accounts.
    const [igPosted, setIgPosted] = useState<Record<string, string>>({})
    const [ytPosted, setYtPosted] = useState<Record<string, string>>({})
    const [fbPosted, setFbPosted] = useState<Record<string, string>>({})

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

    async function handleFacebookPost(page_id: string) {
        const key = `${hash}:${page_id}`
        const done = trackPosting(key)
        try {
            const res = await postToFacebook({ hash, asset }, page_id)
            if (!res) return
            setFbPosted(prev => ({ ...prev, [key]: res.url }))
        } finally { done() }
    }

    async function handleInstagramPost(instagram_account_id: string) {
        const key = `${hash}:${instagram_account_id}`
        const done = trackPosting(key)
        try {
            const res = await postToInstagram({ hash, asset }, instagram_account_id)
            if (!res) return
            setIgPosted(prev => ({ ...prev, [key]: res.url }))
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
    const devtoLink = links[Platform['DEV.to']]
    const isPostingLinkedin = posting.has(`${hash}:${Platform.LinkedIn}`)
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
            {facebookPages.length > 0 && asset.target.includes('Facebook') && PlatformSupport.Facebook.includes(asset.type) && facebookPages.map(page => {
                const key = `${hash}:${page.page_id}`
                const isPosting = posting.has(key)
                const url = fbPosted[key] ?? accounts[Platform.Facebook]?.[page.page_id]
                return url
                    ? <a key={page.page_id} href={url} target="_blank" rel="noopener noreferrer" className={cx(btn({ color: 'facebook', size: 'sm' }))} title={page.page_name}>
                        View on Facebook
                    </a>
                    : <button key={page.page_id} className={btn({ color: 'facebook', size: 'sm' })} onClick={() => handleFacebookPost(page.page_id)} disabled={isPosting} title={page.page_name}>
                        {isPosting ? 'Posting…' : facebookPages.length > 1 ? page.page_name : 'Facebook'}
                    </button>
            })}
            {instagramAccounts.length > 0 && asset.target.includes('Instagram') && PlatformSupport.Instagram.includes(asset.type) && instagramAccounts.map((account) => {
                const key = `${hash}:${account.instagram_account_id}`
                const isPosting = posting.has(key)
                const url = igPosted[key] ?? accounts[Platform.Instagram]?.[account.instagram_account_id]
                return url
                    ? <a key={account.instagram_account_id} href={url} target="_blank" rel="noopener noreferrer" className={cx(btn({ color: 'instagram', size: 'sm' }))} title={account.username}>
                        View on Instagram
                    </a>
                    : <button key={account.instagram_account_id} className={btn({ color: 'instagram', size: 'sm' })} onClick={() => handleInstagramPost(account.instagram_account_id)} disabled={isPosting} title={account.username}>
                        {isPosting ? 'Posting…' : instagramAccounts.length > 1 ? `@${account.username}` : 'Instagram'}
                    </button>
            })}
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
                // Prefer this session's upload; otherwise the URL stored for this channel.
                const url = ytPosted[key] ?? accounts[Platform.YouTube]?.[channel.channel_id]
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
