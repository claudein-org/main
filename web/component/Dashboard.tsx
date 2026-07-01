'use client'

import { justify } from "@/css/layout.css"
import { channelRow, color, connectedBadge, connectMenuRow, dashboardLayout, dashboardMain, font, navItem, sidebar, sidebarBrand, sidebarDivider, sidebarLogo, sidebarNav, sidebarPendingBadge, sidebarSectionTitle, sidebarSpacer, sidebarVersion, ytAvatar } from "@/css/style.css"
import { app } from "@/lib/app"
import { version } from "@/lib/version"
import { btn } from "@/css/style.css"
import { cx } from "@/styled-system/css"
import type { Page } from "@/provider/facebook"
import type { Account } from "@/provider/instagram"
import type { Channel } from "@/provider/youtube"
import type { Analytics } from "@/server/analytics"
import { isCardPending, mergePublished, providerStatuses, type Connections, type PublishedMap } from "@/lib/postStatus"
import { inWindow, type Window } from "@/lib/schedule"
import { Platform, proto } from "@claudein.org/common"
import { Fragment, useEffect, useState } from "react"
import AnalyticsView from "./AnalyticsView"
import Reload from "./Reload"
import ScheduleView from "./ScheduleView"

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_HOUR_MS = 60 * 60 * 1000

const VIEWS = [
    { id: 'today', label: 'Today' },
    { id: 'next7', label: 'Next 7 Days' },
    { id: 'next30', label: 'Next 30 Days' },
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
}

function ServiceRow({ name, connected, href, color }: ServiceRowProps) {
    return (
        <div className={connectMenuRow}>
            <span>{name}</span>
            {connected
                ? <span className={connectedBadge}>✓ Connected</span>
                : <a className={cx(btn({ color, size: 'sm' }))} href={href} target="_blank">Connect</a>
            }
        </div>
    )
}

export default function Dashboard({ port, expires_at, facebookPages, instagramAccounts, youtubeConnected, youtubeChannels, devtoConnected, published, analytics }: Props) {
    const [now, setNow] = useState(() => Date.now())
    const [bundle, setBundle] = useState<proto.Bundle | null>(null)
    const [view, setView] = useState<View>('today')
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

    // Up/Down arrows move between sidebar views (Today, Next 7 Days, …).
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

    // Unpublished-post counts per schedule window — shown next to the
    // Today / Next 7 Days / Next 30 Days sidebar tabs.
    const scheduleCounts: Record<Window, number> = { today: 0, next7: 0, next30: 0 }
    for (const period of Object.keys(scheduleCounts) as Window[]) {
        scheduleCounts[period] = payloads.filter(p =>
            inWindow(p.asset.schedule, period, now) && isCardPending(providerStatuses(p, mergedPublished, connections))
        ).length
    }

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
                        <Fragment key={v.id}>
                            {v.id === 'analytics' && <div className={sidebarDivider} />}
                            <button className={cx(navItem({ active: view === v.id }), justify.between)} onClick={() => setView(v.id)}>
                                <span>{v.label}</span>
                                {v.id !== 'analytics' && !!scheduleCounts[v.id] && (
                                    <span className={sidebarPendingBadge}>{scheduleCounts[v.id]}</span>
                                )}
                            </button>
                        </Fragment>
                    ))}
                </div>

                <div className={sidebarSpacer} />

                <div>
                    <div className={sidebarSectionTitle}>Connections</div>
                    <ServiceRow name="LinkedIn" connected={linkedinConnected} href={app.linkedin} color="linkedin" />
                    <div className={connectMenuRow}>
                        <span>Facebook</span>
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
                        <span>Instagram</span>
                        <a className={cx(btn({ color: 'instagram', size: 'sm' }))} href={app.instagram} target="_blank">
                            {instagramAccounts.length > 0 ? 'Add account' : 'Connect'}
                        </a>
                    </div>
                    {instagramAccounts.map(account => (
                        <div key={account.instagram_account_id} className={channelRow}>
                            <span>@{account.username}</span>
                        </div>
                    ))}
                    <ServiceRow name="dev.to" connected={devtoConnected} href={app.auth.devto} color="devto" />

                    {/* YouTube supports multiple channels, so it lists each connected channel and always offers to add another. */}
                    <div className={connectMenuRow}>
                        <span>YouTube</span>
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
                {(view === 'today' || view === 'next7' || view === 'next30') && (
                    <ScheduleView period={view} now={now} payloads={payloads} published={mergedPublished} connections={connections} onPosted={handlePosted} />
                )}
                {view === 'analytics' && <AnalyticsView analytics={analytics} connected={connected} />}
            </div>
        </div>
    )
}
