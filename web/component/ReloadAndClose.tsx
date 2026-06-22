'use client'

import { useEffect } from "react"

export default function ReloadAndClose() {
    useEffect(() => {
        const msg = new BroadcastChannel("reload")
        msg.postMessage("reload")
        msg.close()
        window.close()
    }, [])
    return null
}