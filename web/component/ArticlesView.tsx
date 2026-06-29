'use client'
import { align, col, gap, row } from "@/css/layout.css"
import { articleBody, articleCard, articlesGrid, avatar, font, muted } from "@/css/style.css"
import type { Account } from "@/provider/instagram"
import type { Channel } from "@/provider/youtube"
import { cx } from "@/styled-system/css"
import { proto } from "@claudein.org/common"
import Markdown from "react-markdown"
import PostActions from "./PostActions"

type Published = Record<string, Record<number, string>>
interface Props {
    payloads: proto.Payload[]
    published: Published
    linkedinConnected: boolean
    facebookConnected: boolean
    instagramAccounts: Account[]
    youtubeConnected: boolean
    youtubeChannels: Channel[]
    devtoConnected: boolean
}

export default function ArticlesView({ payloads, published, linkedinConnected, facebookConnected, instagramAccounts, youtubeConnected, youtubeChannels, devtoConnected }: Props) {
    if (payloads.length === 0) {
        return <div className={muted}>No articles yet — add an article post pointing to a .md file in your brand.yml.</div>
    }

    return (
        <div className={articlesGrid}>
            {payloads.map((payload) => payload.asset.type === 'article' && (
                <div key={payload.hash} className={articleCard}>
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
                    <PostActions
                        payload={payload}
                        published={published}
                        linkedinConnected={linkedinConnected}
                        facebookConnected={facebookConnected}
                        instagramAccounts={instagramAccounts}
                        youtubeConnected={youtubeConnected}
                        youtubeChannels={youtubeChannels}
                        devtoConnected={devtoConnected}
                    />
                </div>
            ))}
        </div>
    )
}
