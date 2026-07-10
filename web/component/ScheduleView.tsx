'use client'
import { align, col, gap, width } from "@/css/layout.css"
import { cardSection, cardSectionHeader, cardSectionTitle, muted, postsGrid, statusPill } from "@/css/style.css"
import { isCardPending, providerStatuses, type Connections, type PublishedMap } from "@/lib/postStatus"
import { inWindow, type Window } from "@/lib/schedule"
import { cx } from "@/styled-system/css"
import { proto } from "@claudein.org/common"
import { ArticleCard } from "./ArticleCard"
import { MediaCard } from "./MediaCard"
import { PostCard } from "./PostCard"

interface CardProps {
    payloads: proto.Payload[]
    published: PublishedMap
    connections: Connections
    onPosted: (hash: string, provider: number, accountId: string, url: string) => void
}

interface Props extends CardProps {
    period: Window
    now: number
}

const EMPTY_LABEL: Record<Window, string> = {
    overdue: 'Nothing past due.',
    today: 'Nothing due today (or past due).',
    next7: 'Nothing due in the next 7 days (or past due).',
    next30: 'Nothing due in the next 30 days (or past due).',
}

function AssetCard({ payload, published, connections, onPosted }: { payload: proto.Payload } & Omit<CardProps, 'payloads'>) {
    switch (payload.asset.type) {
        case 'post':
            return <PostCard payload={payload} published={published} connections={connections} onPosted={onPosted} />
        case 'image':
        case 'video':
            return <MediaCard payload={payload} published={published} connections={connections} onPosted={onPosted} />
        case 'article':
            return <ArticleCard payload={payload} published={published} connections={connections} onPosted={onPosted} />
    }
}

// Shared view for the Today / Next 7 Days / Next 30 Days sidebar tabs — a
// single feed across every asset type, filtered by `schedule` instead of by
// type, and split into Needs posting / Posted the same way the old
// per-type views were.
export default function ScheduleView({ period, now, payloads, published, connections, onPosted }: Props) {
    const due = payloads
        .filter(p => inWindow(p.asset.schedule, period, now))
        .sort((a, b) => a.asset.schedule.localeCompare(b.asset.schedule))

    if (due.length === 0) return <div className={muted}>{EMPTY_LABEL[period]}</div>

    const pending = due.filter(p => isCardPending(providerStatuses(p, published, connections)))
    const posted = due.filter(p => !isCardPending(providerStatuses(p, published, connections)))

    return (
        <div className={cx(col, gap.xl, width.full, align.center)}>
            {pending.length > 0 && (
                <div className={cardSection}>
                    <div className={cardSectionHeader}>
                        <span className={cardSectionTitle}>Needs posting</span>
                        <span className={statusPill({ tone: 'pending' })}>{pending.length}</span>
                    </div>
                    <div className={postsGrid}>
                        {pending.map(payload => <AssetCard key={payload.hash} payload={payload} published={published} connections={connections} onPosted={onPosted} />)}
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
                        {posted.map(payload => <AssetCard key={payload.hash} payload={payload} published={published} connections={connections} onPosted={onPosted} />)}
                    </div>
                </div>
            )}
        </div>
    )
}
