'use client'

import { fixedTopRight } from "@/css/layout.css"
import { btn, connectedBadge, connectMenu, connectMenuRow } from "@/css/style.css"
import { app } from "@/lib/app"
import { cx } from "@/styled-system/css"
import { useEffect, useState } from "react"
import WS from "./Posts"
import Reload from "./Reload"

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_HOUR_MS = 60 * 60 * 1000

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

export default function Poster({ port, expires_at, facebookConnected, instagramConnected, youtubeConnected, published }: Props) {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), ONE_HOUR_MS)
        return () => clearInterval(id)
    }, [])

    const linkedinConnected = !!expires_at && (expires_at * 1000 - now) >= ONE_DAY_MS

    return <>
        <Reload />

        <div className={fixedTopRight}>
            <div className={connectMenu}>
                <ServiceRow name="LinkedIn" connected={linkedinConnected} href={app.linkedin} color="linkedin" />
                <ServiceRow name="Facebook" connected={facebookConnected} href={app.facebook} color="facebook" />
                <ServiceRow name="Instagram" connected={instagramConnected} href={app.instagram} color="instagram" />
                <ServiceRow name="YouTube" connected={youtubeConnected} href={app.youtube} color="youtube" />
            </div>
        </div>

        {(linkedinConnected || facebookConnected || instagramConnected || youtubeConnected)
            ? <WS
                port={port}
                published={published}
                linkedinConnected={linkedinConnected}
                facebookConnected={facebookConnected}
                instagramConnected={instagramConnected}
                youtubeConnected={youtubeConnected}
              />
            : <a className={cx(btn({ color: 'linkedin' }))} href={app.linkedin} target="_blank">Connect to LinkedIn</a>
        }
    </>
}
