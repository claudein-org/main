'use client'
import { align, col, gap, row, width } from "@/css/layout.css"
import { avatar, cardSection, cardSectionHeader, cardSectionTitle, font, muted, postCard, postsGrid, preWrap, statusPill } from "@/css/style.css"
import { isCardPending, providerStatuses, type Connections, type PublishedMap } from "@/lib/postStatus"
import { cx } from "@/styled-system/css"
import { proto } from "@claudein.org/common"
import PostActions from "./PostActions"

interface Props {
    payloads: proto.Payload[]
    published: PublishedMap
    connections: Connections
    onPosted: (hash: string, provider: number, accountId: string, url: string) => void
}

function Card({ payload, published, connections, onPosted }: { payload: proto.Payload } & Omit<Props, 'payloads'>) {
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

export default function PostsView({ payloads, published, connections, onPosted }: Props) {
    if (payloads.length === 0) return <div className={muted}>No posts yet — add one to your brand.yml.</div>

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
                    <div className={postsGrid}>
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
                    <div className={postsGrid}>
                        {posted.map(payload => <Card key={payload.hash} payload={payload} published={published} connections={connections} onPosted={onPosted} />)}
                    </div>
                </div>
            )}
        </div>
    )
}
