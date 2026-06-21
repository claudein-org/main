'use client'
import { useEffect, useState } from "react"

interface Props {
    port: number
}

export default function WS({ port }: Props) {
    const [data, setData] = useState<string>()
    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:${port}`)
        ws.onmessage = (event) => {
            setData(event.data)
        }
        return () => ws.close()
    }, [port])

    return <div>
        ME WS {port}
        <pre>
            {JSON.stringify(data, null, 2)}
        </pre>
    </div>
}