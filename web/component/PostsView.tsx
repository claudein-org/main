'use client'
import { align, col, gap, row } from "@/css/layout.css"
import { avatar, font, muted, postCard, postsGrid, preWrap } from "@/css/style.css"
import type { Page } from "@/provider/facebook"
import type { Account } from "@/provider/instagram"
import type { Channel } from "@/provider/youtube"
import { cx } from "@/styled-system/css"
import { proto } from "@claudein.org/common"
import PostActions from "./PostActions"


type Published = Record<string, Record<number, Record<string, string>>>
interface Props {
    payloads: proto.Payload[]
    published: Published
    linkedinConnected: boolean
    facebookPages: Page[]
    instagramAccounts: Account[]
    youtubeConnected: boolean
    youtubeChannels: Channel[]
    devtoConnected: boolean
}

export default function PostsView({ payloads, published, linkedinConnected, facebookPages, instagramAccounts, youtubeConnected, youtubeChannels, devtoConnected }: Props) {
    if (payloads.length === 0) return <div className={muted}>No posts yet — add one to your brand.yml.</div>

    return (
        <div className={postsGrid}>
            {payloads.map((payload) => {
                const { hash, asset } = payload
                if (asset.type !== 'post') return null
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
                        <p className={preWrap}>{asset.text}</p>
                        <PostActions
                            payload={payload}
                            published={published}
                            linkedinConnected={linkedinConnected}
                            facebookPages={facebookPages}
                            instagramAccounts={instagramAccounts}
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
