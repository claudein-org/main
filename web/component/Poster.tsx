'use client'

import { btn } from "@/css/style.css"
import { col, fixedTopRight, gap } from "@/css/layout.css"
import { app } from "@/lib/app"
import { cx } from "@/styled-system/css"
import { useEffect, useState } from "react"
import Reload from "./Reload"
import WS from "./WS"

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_HOUR_MS = 60 * 60 * 1000

interface Props {
    port: number
    expires_at: number | undefined
    facebookConnected: boolean
    instagramConnected: boolean
    published: { [post_id: number]: string }
}

export default function Poster({ port, expires_at, facebookConnected, instagramConnected, published }: Props) {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), ONE_HOUR_MS)
        return () => clearInterval(id)
    }, [])

    const needsReconnect = !expires_at || (expires_at * 1000 - now) < ONE_DAY_MS

    return <>
        {(needsReconnect || !facebookConnected || !instagramConnected) && (
            <div className={fixedTopRight}>
                {needsReconnect && (
                    <a className={cx(btn({ color: 'dark' }))} target="_blank" href={app.linkedin}>
                        Connect to LinkedIn
                    </a>
                )}
                {!facebookConnected && (
                    <a className={cx(btn({ color: 'facebook' }))} target="_blank" href={app.facebook}>
                        Connect to Facebook
                    </a>
                )}
                {!instagramConnected && (
                    <a className={cx(btn({ color: 'instagram' }))} target="_blank" href={app.instagram}>
                        Connect to Instagram
                    </a>
                )}
            </div>
        )}

        {needsReconnect && <Reload />}
        {!needsReconnect && <WS port={port} published={published} />}
    </>
}
