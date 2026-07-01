'use client'
import { align, col, gap, row, width } from "@/css/layout.css"
import { avatar, cardSection, cardSectionHeader, cardSectionTitle, font, muted, postCard, postImg, postsGrid, preWrap, statusPill } from "@/css/style.css"
import { isCardPending, providerStatuses, type Connections, type PublishedMap } from "@/lib/postStatus"
import { cx } from "@/styled-system/css"
import { proto } from "@claudein.org/common"
import PostActions from "./PostActions"

interface Props {
    kind: 'image' | 'video'
    payloads: proto.Payload[]
    published: PublishedMap
    connections: Connections
    onPosted: (hash: string, provider: number, accountId: string, url: string) => void
}

function Card({ payload, published, connections, onPosted }: { payload: proto.Payload } & Omit<Props, 'kind' | 'payloads'>) {
    const { asset } = payload
    if (asset.type !== 'image' && asset.type !== 'video') return null
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
            {asset.title && <p className={font.weight.medium}>{asset.title}</p>}
            {asset.description && <p className={preWrap}>{asset.description}</p>}
            {asset.type === 'image'
                ? <img className={postImg} src={`data:image/*;base64,${asset.base64}`} alt={asset.title ?? 'Image'} />
                : <video className={postImg} autoPlay loop muted playsInline>
                    <source src={`data:video/*;base64,${asset.base64}`} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            }
            <PostActions payload={payload} published={published} connections={connections} onPosted={onPosted} />
        </div>
    )
}

// Shared view for the Images and Videos sidebar tabs — both are media assets
// with optional title/description and a base64-encoded body.
export default function MediaView({ kind, payloads, published, connections, onPosted }: Props) {
    if (payloads.length === 0) {
        return <div className={muted}>
            {kind === 'image'
                ? 'No images yet — add an image asset pointing to a .jpg/.png file in your brand.yml.'
                : 'No videos yet — add a video asset pointing to a .mp4 file in your brand.yml.'}
        </div>
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
