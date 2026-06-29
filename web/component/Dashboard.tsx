'use client'

import { channelRow, color, connectedBadge, connectMenuRow, dashboardLayout, dashboardMain, font, navItem, sidebar, sidebarBrand, sidebarLogo, sidebarNav, sidebarSectionTitle, sidebarSpacer, ytAvatar } from "@/css/style.css"
import { app } from "@/lib/app"
import { btn } from "@/css/style.css"
import { cx } from "@/styled-system/css"
import type { Channel } from "@/provider/youtube"
import { proto } from "@claudein.org/common"
import { useEffect, useState } from "react"
import ArticlesView from "./ArticlesView"
import BrandView from "./BrandView"
import PostsView from "./PostsView"
import Reload from "./Reload"

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_HOUR_MS = 60 * 60 * 1000

const VIEWS = [
    { id: 'brand', label: 'Brand' },
    { id: 'posts', label: 'Posts' },
    { id: 'articles', label: 'Articles' },
] as const

type View = (typeof VIEWS)[number]['id']

interface Props {
    port: number
    expires_at: number | undefined
    facebookConnected: boolean
    instagramConnected: boolean
    youtubeConnected: boolean
    youtubeChannels: Channel[]
    devtoConnected: boolean
    published: Record<string, Record<number, string>>
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

export default function Dashboard({ port, expires_at, facebookConnected, instagramConnected, youtubeConnected, youtubeChannels, devtoConnected, published }: Props) {
    const [now, setNow] = useState(() => Date.now())
    const [bundle, setBundle] = useState<proto.Bundle | null>(null)
    const [view, setView] = useState<View>('brand')

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

    const payloads = bundle?.payloads ?? []
    const articlePayloads = payloads.filter(p => p.post.type === 'article')
    const postPayloads = payloads.filter(p => p.post.type !== 'article')

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
                    <ServiceRow name="LinkedIn" connected={linkedinConnected} href={app.linkedin} color="linkedin" />
                    <ServiceRow name="Facebook" connected={facebookConnected} href={app.facebook} color="facebook" />
                    <ServiceRow name="Instagram" connected={instagramConnected} href={app.instagram} color="instagram" />
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
            </aside>

            <div className={dashboardMain}>
                {view === 'brand' && <BrandView brand={bundle?.brand} />}
                {view === 'posts' && (
                    <PostsView
                        payloads={postPayloads}
                        published={published}
                        linkedinConnected={linkedinConnected}
                        facebookConnected={facebookConnected}
                        instagramConnected={instagramConnected}
                        youtubeConnected={youtubeConnected}
                        youtubeChannels={youtubeChannels}
                    />
                )}
                {view === 'articles' && <ArticlesView payloads={articlePayloads} />}
            </div>
        </div>
    )
}
