'use client'
import { proto } from "@claudein.org/common"
import { useEffect, useState } from "react"

interface Props {
    published: { [post_id: number]: string }
    port: number
}

export default function WS({ port, published }: Props) {
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
            payload?.posts.map(({ post_id, date, text, image }) =>
                /*
                    TODO: 
                    1. For each post create a preview that looks like a real linkedin post.
                    2. Add a post button that will publish the post to linkedin using the server/post.ts server function.
                    3. After publishing the post, add a link to the post on linkedin. 
                    4. If the post has already been published, show the link to the post on linkedin instead of the post button.
                */
                <div key={post_id}>
                    <h3>{post_id} - {date}</h3>
                    <p>{text}</p>
                    {image &&
                        <img key={image.src} src={`data:image/*;base64,${image.base64}`} alt={image.src} />
                    }
                </div>
            )
        }
    </div>
}