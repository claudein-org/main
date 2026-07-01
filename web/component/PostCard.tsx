'use client'
import { align, col, gap, row } from "@/css/layout.css"
import { avatar, font, muted, postCard, preWrap } from "@/css/style.css"
import { type Connections, type PublishedMap } from "@/lib/postStatus"
import { cx } from "@/styled-system/css"
import { proto } from "@claudein.org/common"
import PostActions from "./PostActions"

interface Props {
    payload: proto.Payload
    published: PublishedMap
    connections: Connections
    onPosted: (hash: string, provider: number, accountId: string, url: string) => void
}

export function PostCard({ payload, published, connections, onPosted }: Props) {
    const { asset } = payload
    if (asset.type !== 'post') return null
    return (
        <div className={postCard}>
            <div className={cx(row, align.center, gap.sm)}>
                <div className={avatar} />
                <div className={cx(col, gap.xs)}>
                    <span className={font.weight.medium}>You</span>
                    <span className={cx(muted, font.size.sm)}>
                        {new Date(asset.created).toLocaleDateString()}
                    </span>
                </div>
            </div>
            <p className={preWrap}>{asset.text}</p>
            <PostActions payload={payload} published={published} connections={connections} onPosted={onPosted} />
        </div>
    )
}
