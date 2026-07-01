'use client'
import { align, col, gap, row, width } from "@/css/layout.css"
import { articleBody, articleCard, articlesGrid, avatar, cardSection, cardSectionHeader, cardSectionTitle, font, muted, statusPill } from "@/css/style.css"
import { isCardPending, providerStatuses, type Connections, type PublishedMap } from "@/lib/postStatus"
import { cx } from "@/styled-system/css"
import { proto } from "@claudein.org/common"
import Markdown from "react-markdown"
import PostActions from "./PostActions"

interface Props {
    payloads: proto.Payload[]
    published: PublishedMap
    connections: Connections
    onPosted: (hash: string, provider: number, accountId: string, url: string) => void
}

function Card({ payload, published, connections, onPosted }: { payload: proto.Payload } & Omit<Props, 'payloads'>) {
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

export default function ArticlesView({ payloads, published, connections, onPosted }: Props) {
    if (payloads.length === 0) {
        return <div className={muted}>No articles yet — add an article post pointing to a .md file in your brand.yml.</div>
    }

    const pending = payloads.filter(p => isCardPending(providerStatuses(p, published, connections)))
    const posted = payloads.filter(p => !isCardPending(providerStatuses(p, published, connections)))

    return (
        <div className={cx(col, gap.xl, width.full, align.center)}>
            {pending.length > 0 && (
                <div className={cardSection}>
                    <div className={cardSectionHeader}>
                        <span className={cardSectionTitle}>Needs posting</span>
                        <span className={statusPill({ tone: 'pending' })}>{pending.length}</span>
                    </div>
                    <div className={articlesGrid}>
                        {pending.map(payload => <Card key={payload.hash} payload={payload} published={published} connections={connections} onPosted={onPosted} />)}
                    </div>
                </div>
            )}
            {posted.length > 0 && (
                <div className={cardSection}>
                    <div className={cardSectionHeader}>
                        <span className={cardSectionTitle}>Posted</span>
                        <span className={statusPill({ tone: 'posted' })}>{posted.length}</span>
                    </div>
                    <div className={articlesGrid}>
                        {posted.map(payload => <Card key={payload.hash} payload={payload} published={published} connections={connections} onPosted={onPosted} />)}
                    </div>
                </div>
            )}
        </div>
    )
}
