'use client'

import { useEffect } from "react"

interface Props {
    beforeReload?: () => void
}

export default function Reload({ beforeReload }: Props) {
    useEffect(() => {
        const msg = new BroadcastChannel("reload")
        const handler = () => {
            if (beforeReload) beforeReload()
            window.location.reload()
        }

        msg.addEventListener("message", handler, { once: true })

        return () => {
            msg.removeEventListener("message", handler)
            msg.close()
        }
    }, [])

    return null
}
