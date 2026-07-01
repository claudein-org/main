'use client'

import { align, gap, row } from "@/css/layout.css"
import { channelRow, color, connectedBadge, connectMenuRow, dashboardLayout, dashboardMain, font, navItem, sidebar, sidebarBrand, sidebarLogo, sidebarNav, sidebarPendingBadge, sidebarSectionTitle, sidebarSpacer, sidebarVersion, ytAvatar } from "@/css/style.css"
import { app } from "@/lib/app"
import { version } from "@/lib/version"
import { btn } from "@/css/style.css"
import { cx } from "@/styled-system/css"
import type { Page } from "@/provider/facebook"
import type { Account } from "@/provider/instagram"
import type { Channel } from "@/provider/youtube"
import type { Analytics } from "@/server/analytics"
import { mergePublished, pendingCountsByProvider, type Connections, type PublishedMap } from "@/lib/postStatus"
import { Platform, proto } from "@claudein.org/common"
import { useEffect, useState } from "react"
import AnalyticsView from "./AnalyticsView"
import ArticlesView from "./ArticlesView"
import BrandView from "./BrandView"
import MediaView from "./MediaView"
import PostsView from "./PostsView"
import Reload from "./Reload"

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_HOUR_MS = 60 * 60 * 1000

const VIEWS = [
    { id: 'brand', label: 'Brand' },
    { id: 'posts', label: 'Posts' },
    { id: 'images', label: 'Images' },
    { id: 'videos', label: 'Videos' },
    { id: 'articles', label: 'Articles' },
    { id: 'analytics', label: 'Analytics' },
] as const

type View = (typeof VIEWS)[number]['id']

interface Props {
    port: number
    expires_at: number | undefined
    facebookPages: Page[]
    instagramAccounts: Account[]
    youtubeConnected: boolean
    youtubeChannels: Channel[]
    devtoConnected: boolean
    published: PublishedMap
    analytics: Analytics
}

interface ServiceRowProps {
    name: string
    connected: boolean
    href: string
    color: 'dark' | 'linkedin' | 'facebook' | 'instagram' | 'youtube' | 'claude' | 'devto'
    pending?: number
}

function ServiceRow({ name, connected, href, color, pending }: ServiceRowProps) {
    return (
        <div className={connectMenuRow}>
            <span>{name}</span>
            {connected
                ? <span className={cx(row, align.center, gap.xs)}>
                    {!!pending && <span className={sidebarPendingBadge} title={`${pending} still need to post`}>{pending}</span>}
                    <span className={connectedBadge}>✓ Connected</span>
                </span>
                : <a className={cx(btn({ color, size: 'sm' }))} href={href} target="_blank">Connect</a>
            }
        </div>
    )
}

export default function Dashboard({ port, expires_at, facebookPages, instagramAccounts, youtubeConnected, youtubeChannels, devtoConnected, published, analytics }: Props) {
    const [now, setNow] = useState(() => Date.now())
    const [bundle, setBundle] = useState<proto.Bundle | null>(null)
    const [view, setView] = useState<View>('brand')
    // Posts made during this visit, merged over the server-loaded `published`
    // map so card status and sidebar counts update immediately without a refetch.
    const [sessionPosted, setSessionPosted] = useState<PublishedMap>({})
    const handlePosted = (hash: string, provider: number, accountId: string, url: string) => {
        setSessionPosted(prev => ({
            ...prev,
            [hash]: { ...prev[hash], [provider]: { ...prev[hash]?.[provider], [accountId]: url } },
        }))
    }
    const mergedPublished = mergePublished(published, sessionPosted)

    useEffect(() => {
        const match = document.cookie.match(/(?:^|;\s*)claudein_tab=([^;]+)/)
        const saved = match?.[1] as View | undefined
        if (saved && VIEWS.some(v => v.id === saved)) setView(saved)
    }, [])

    useEffect(() => {
        document.cookie = `claudein_tab=${view}; path=/; max-age=${365 * 24 * 60 * 60}; SameSite=Lax`
    }, [view])

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), ONE_HOUR_MS)
        return () => clearInterval(id)
    }, [])

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:${port}`)
        ws.onmessage = (event) => {
            setBundle(proto.Bundle.parse(JSON.parse(event.data)))
        }
        return () => ws.close()
    }, [port])

    // Up/Down arrows move between sidebar views (Brand, Posts, …).
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
            if (e.key !== 'ArrowUp' && e.key !== 'ArrowDown') return
            e.preventDefault()
            setView(prev => {
                const i = VIEWS.findIndex(v => v.id === prev)
                const next = e.key === 'ArrowDown'
                    ? Math.min(VIEWS.length - 1, i + 1)
                    : Math.max(0, i - 1)
                return VIEWS[next]?.id ?? prev
            })
        }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [])

    const linkedinConnected = !!expires_at && (expires_at * 1000 - now) >= ONE_DAY_MS

    // Per-provider connection state for the analytics per-provider cards.
    const connected: Record<number, boolean> = {
        [Platform.LinkedIn]: linkedinConnected,
        [Platform.Facebook]: facebookPages.length > 0,
        [Platform.Instagram]: instagramAccounts.length > 0,
        [Platform.YouTube]: youtubeConnected,
        [Platform['DEV.to']]: devtoConnected,
    }

    const connections: Connections = {
        linkedinConnected, facebookPages, instagramAccounts, youtubeConnected, youtubeChannels, devtoConnected,
    }

    const payloads = bundle?.payloads ?? []
    const postPayloads = payloads.filter(p => p.asset.type === 'post')
    const imagePayloads = payloads.filter(p => p.asset.type === 'image')
    const videoPayloads = payloads.filter(p => p.asset.type === 'video')
    const articlePayloads = payloads.filter(p => p.asset.type === 'article')

    // "Still need to post" counts per provider, across every card — shown next
    // to each connection in the sidebar.
    const pendingCounts = pendingCountsByProvider(payloads, mergedPublished, connections)

    return (
        <div className={dashboardLayout}>
            <Reload />

            <aside className={sidebar}>
                <div className={sidebarBrand}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img className={sidebarLogo} src="/logo.svg" alt="claudein" />
                    <span className={font.weight.bold}>
                        <span className={color.claude}>claude</span><span className={color.linkedin}>in</span>
                    </span>
                </div>

                <div className={sidebarNav}>
                    {VIEWS.map(v => (
                        <button key={v.id} className={navItem({ active: view === v.id })} onClick={() => setView(v.id)}>{v.label}</button>
                    ))}
                </div>

                <div className={sidebarSpacer} />

                <div>
                    <div className={sidebarSectionTitle}>Connections</div>
                    <ServiceRow name="LinkedIn" connected={linkedinConnected} href={app.linkedin} color="linkedin" pending={pendingCounts[Platform.LinkedIn]} />
                    <div className={connectMenuRow}>
                        <span className={cx(row, align.center, gap.xs)}>
                            Facebook
                            {!!pendingCounts[Platform.Facebook] && <span className={sidebarPendingBadge} title={`${pendingCounts[Platform.Facebook]} still need to post`}>{pendingCounts[Platform.Facebook]}</span>}
                        </span>
                        <a className={cx(btn({ color: 'facebook', size: 'sm' }))} href={app.facebook} target="_blank">
                            {facebookPages.length > 0 ? 'Add page' : 'Connect'}
                        </a>
                    </div>
                    {facebookPages.map(page => (
                        <div key={page.page_id} className={channelRow}>
                            <span>{page.page_name}</span>
                        </div>
                    ))}
                    <div className={connectMenuRow}>
                        <span className={cx(row, align.center, gap.xs)}>
                            Instagram
                            {!!pendingCounts[Platform.Instagram] && <span className={sidebarPendingBadge} title={`${pendingCounts[Platform.Instagram]} still need to post`}>{pendingCounts[Platform.Instagram]}</span>}
                        </span>
                        <a className={cx(btn({ color: 'instagram', size: 'sm' }))} href={app.instagram} target="_blank">
                            {instagramAccounts.length > 0 ? 'Add account' : 'Connect'}
                        </a>
                    </div>
                    {instagramAccounts.map(account => (
                        <div key={account.instagram_account_id} className={channelRow}>
                            <span>@{account.username}</span>
                        </div>
                    ))}
                    <ServiceRow name="dev.to" connected={devtoConnected} href={app.auth.devto} color="devto" pending={pendingCounts[Platform['DEV.to']]} />

                    {/* YouTube supports multiple channels, so it lists each connected channel and always offers to add another. */}
                    <div className={connectMenuRow}>
                        <span className={cx(row, align.center, gap.xs)}>
                            YouTube
                            {!!pendingCounts[Platform.YouTube] && <span className={sidebarPendingBadge} title={`${pendingCounts[Platform.YouTube]} still need to post`}>{pendingCounts[Platform.YouTube]}</span>}
                        </span>
                        <a className={cx(btn({ color: 'youtube', size: 'sm' }))} href={app.youtube} target="_blank">
                            {youtubeChannels.length > 0 ? 'Add channel' : 'Connect'}
                        </a>
                    </div>
                    {youtubeChannels.map(channel => (
                        <div key={channel.channel_id} className={channelRow}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img className={ytAvatar} src={channel.thumbnail} alt="" />
                            <span>{channel.title}</span>
                        </div>
                    ))}
                </div>

                <span className={sidebarVersion}>v{version}</span>
            </aside>

            <div className={dashboardMain}>
                {view === 'brand' && <BrandView brand={bundle?.brand} />}
                {view === 'posts' && (
                    <PostsView payloads={postPayloads} published={mergedPublished} connections={connections} onPosted={handlePosted} />
                )}
                {view === 'images' && (
                    <MediaView kind="image" payloads={imagePayloads} published={mergedPublished} connections={connections} onPosted={handlePosted} />
                )}
                {view === 'videos' && (
                    <MediaView kind="video" payloads={videoPayloads} published={mergedPublished} connections={connections} onPosted={handlePosted} />
                )}
                {view === 'articles' && (
                    <ArticlesView payloads={articlePayloads} published={mergedPublished} connections={connections} onPosted={handlePosted} />
                )}
                {view === 'analytics' && <AnalyticsView analytics={analytics} connected={connected} />}
            </div>
        </div>
    )
}
