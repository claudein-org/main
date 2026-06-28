'use client'

import { color, connectedBadge, connectMenuRow, dashboardLayout, dashboardMain, font, navItem, sidebar, sidebarBrand, sidebarLogo, sidebarNav, sidebarSectionTitle, sidebarSpacer } from "@/css/style.css"
import { app } from "@/lib/app"
import { btn } from "@/css/style.css"
import { cx } from "@/styled-system/css"
import { proto } from "@claudein.org/common"
import { useEffect, useState } from "react"
import BrandView from "./BrandView"
import PostsView from "./PostsView"
import Reload from "./Reload"

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_HOUR_MS = 60 * 60 * 1000

type View = 'brand' | 'posts'

interface Props {
    port: number
    expires_at: number | undefined
    facebookConnected: boolean
    instagramConnected: boolean
    youtubeConnected: boolean
    published: Record<string, Record<number, string>>
}

interface ServiceRowProps {
    name: string
    connected: boolean
    href: string
    color: 'dark' | 'linkedin' | 'facebook' | 'instagram' | 'youtube' | 'claude'
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

export default function Dashboard({ port, expires_at, facebookConnected, instagramConnected, youtubeConnected, published }: Props) {
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

    const linkedinConnected = !!expires_at && (expires_at * 1000 - now) >= ONE_DAY_MS

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
                    <button className={navItem({ active: view === 'brand' })} onClick={() => setView('brand')}>Brand</button>
                    <button className={navItem({ active: view === 'posts' })} onClick={() => setView('posts')}>Posts</button>
                </div>

                <div className={sidebarSpacer} />

                <div>
                    <div className={sidebarSectionTitle}>Connections</div>
                    <ServiceRow name="LinkedIn" connected={linkedinConnected} href={app.linkedin} color="linkedin" />
                    <ServiceRow name="Facebook" connected={facebookConnected} href={app.facebook} color="facebook" />
                    <ServiceRow name="Instagram" connected={instagramConnected} href={app.instagram} color="instagram" />
                    <ServiceRow name="YouTube" connected={youtubeConnected} href={app.youtube} color="youtube" />
                </div>
            </aside>

            <div className={dashboardMain}>
                {view === 'brand'
                    ? <BrandView brand={bundle?.brand} />
                    : <PostsView
                        payloads={bundle?.payloads ?? []}
                        published={published}
                        linkedinConnected={linkedinConnected}
                        facebookConnected={facebookConnected}
                        instagramConnected={instagramConnected}
                        youtubeConnected={youtubeConnected}
                    />}
            </div>
        </div>
    )
}
