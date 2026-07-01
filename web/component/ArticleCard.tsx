'use client'
import { align, col, gap, row } from "@/css/layout.css"
import { articleBody, articleCard, avatar, font, muted } from "@/css/style.css"
import { type Connections, type PublishedMap } from "@/lib/postStatus"
import { cx } from "@/styled-system/css"
import { proto } from "@claudein.org/common"
import Markdown from "react-markdown"
import PostActions from "./PostActions"

interface Props {
    payload: proto.Payload
    published: PublishedMap
    connections: Connections
    onPosted: (hash: string, provider: number, accountId: string, url: string) => void
}

export function ArticleCard({ payload, published, connections, onPosted }: Props) {
    if (payload.asset.type !== 'article') return null
    return (
        <div className={articleCard}>
            <div className={cx(row, align.center, gap.sm)}>
                <div className={avatar} />
                <div className={cx(col, gap.xs)}>
                    <span className={font.weight.medium}>You</span>
                    <span className={cx(muted, font.size.sm)}>
                        {new Date(payload.asset.created).toLocaleDateString()}
                    </span>
                </div>
            </div>
            <div className={articleBody}>
                <Markdown>{payload.asset.markdown}</Markdown>
            </div>
            <PostActions payload={payload} published={published} connections={connections} onPosted={onPosted} />
        </div>
    )
}
