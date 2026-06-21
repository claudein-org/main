import { useEffect } from "react"

interface Props {
    port: number
}

export default function WS({ port }: Props) {
    useEffect(() => {
        // TODO: connect to ws on port <port>
    }, [port])

    return <div>
        ME WS {port}
    </div>
}