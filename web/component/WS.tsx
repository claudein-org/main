'use client'
import { useEffect, useState } from "react"
import { proto } from "../../common/claudin"

interface Props {
    port: number
}

export default function WS({ port }: Props) {
    const [payload, setPayload] = useState<proto.Payload>()

    useEffect(() => {
        const ws = new WebSocket(`ws://localhost:${port}`)
        ws.onmessage = (event) => {
            const data = JSON.parse(event.data)
            setPayload(proto.Payload.parse(data))
        }
        return () => ws.close()
    }, [port])

    return <div>
        {
            payload?.posts.map(({ post_id, date, text, images }) =>
                <div key={post_id}>
                    <h3>{post_id} - {date}</h3>
                    <p>{text}</p>
                    {images?.map(({ src, base64 }) =>
                        <img key={src} src={`data:image/*;base64,${base64}`} alt={src} />
                    )}
                </div>
            )
        }
    </div>
}