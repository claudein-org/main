'use client'

import { btn } from "@/css/style.css"
import { app } from "@/lib/app"
import { cx } from "@/styled-system/css"
import { useEffect, useState } from "react"
import Reload from "./Reload"

const ONE_DAY_MS = 24 * 60 * 60 * 1000
const ONE_HOUR_MS = 60 * 60 * 1000

interface Props {
    port: number
    expires_at: number | undefined

}

export default function Poster({ port, expires_at }: Props) {
    const [now, setNow] = useState(() => Date.now())

    useEffect(() => {
        const id = setInterval(() => setNow(Date.now()), ONE_HOUR_MS)
        return () => clearInterval(id)
    }, [])

    const needsReconnect = !expires_at || (expires_at * 1000 - now) < ONE_DAY_MS

    if (needsReconnect) return <>
        <Reload />
        <a
            className={cx(btn({ color: 'dark' }))}
            target="_blank"
            href={app.linkedin}>
            Connect To LinkedIn
        </a>
    </>

    return <div>
        You can post to Linkedin
    </div>
}