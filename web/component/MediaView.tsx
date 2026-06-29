'use client'
import { align, col, gap, row } from "@/css/layout.css"
import { avatar, font, muted, postCard, postImg, postsGrid, preWrap } from "@/css/style.css"
import type { Channel } from "@/provider/youtube"
import { cx } from "@/styled-system/css"
import { proto } from "@claudein.org/common"
import PostActions from "./PostActions"

type Published = Record<string, Record<number, string>>
interface Props {
    kind: 'image' | 'video'
    payloads: proto.Payload[]
    published: Published
    linkedinConnected: boolean
    facebookConnected: boolean
    instagramConnected: boolean
    youtubeConnected: boolean
    youtubeChannels: Channel[]
    devtoConnected: boolean
}

// Shared view for the Images and Videos sidebar tabs — both are media assets
// with optional title/description and a base64-encoded body.
export default function MediaView({ kind, payloads, published, linkedinConnected, facebookConnected, instagramConnected, youtubeConnected, youtubeChannels, devtoConnected }: Props) {
    if (payloads.length === 0) {
        return <div className={muted}>
            {kind === 'image'
                ? 'No images yet — add an image asset pointing to a .jpg/.png file in your brand.yml.'
                : 'No videos yet — add a video asset pointing to a .mp4 file in your brand.yml.'}
        </div>
    }

    return (
        <div className={postsGrid}>
            {payloads.map((payload) => {
                const { hash, asset } = payload
                if (asset.type !== 'image' && asset.type !== 'video') return null
                return (
                    <div key={hash} className={postCard}>
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
                        <PostActions
                            payload={payload}
                            published={published}
                            linkedinConnected={linkedinConnected}
                            facebookConnected={facebookConnected}
                            instagramConnected={instagramConnected}
                            youtubeConnected={youtubeConnected}
                            youtubeChannels={youtubeChannels}
                            devtoConnected={devtoConnected}
                        />
                    </div>
                )
            })}
        </div>
    )
}
