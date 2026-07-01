'use client'
import { align, col, gap, row } from "@/css/layout.css"
import { avatar, font, muted, postCard, postImg, preWrap } from "@/css/style.css"
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

export function MediaCard({ payload, published, connections, onPosted }: Props) {
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
