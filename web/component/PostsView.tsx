'use client'
import { align, col, gap, row } from "@/css/layout.css"
import { avatar, font, muted, postCard, postImg, postsGrid, preWrap } from "@/css/style.css"
import type { Channel } from "@/provider/youtube"
import { cx } from "@/styled-system/css"
import { PostType, proto } from "@claudein.org/common"
import { ReactElement } from "react"
import PostActions from "./PostActions"


type Published = Record<string, Record<number, string>>
interface Props {
    payloads: proto.Payloads
    published: Published
    linkedinConnected: boolean
    facebookConnected: boolean
    instagramConnected: boolean
    youtubeConnected: boolean
    youtubeChannels: Channel[]
    devtoConnected: boolean
}

export default function PostsView({ payloads, published, linkedinConnected, facebookConnected, instagramConnected, youtubeConnected, youtubeChannels, devtoConnected }: Props) {
    const Poster: { [key in PostType]: (post: Extract<proto.Post, { type: key }>) => ReactElement | null } = {
        text({ text }) {
            return <p className={preWrap}>{text}</p>
        },
        // Articles are shown in their own Articles view, never here.
        article() {
            return null
        },
        image({ text, image }) {
            return (
                <>
                    {text && <p className={preWrap}>{text}</p>}
                    <img className={postImg} src={`data:image/*;base64,${image.base64}`} alt="Post media" />
                </>
            )
        },
        video({ text, video }) {
            return (
                <>
                    {text && <p className={preWrap}>{text}</p>}
                    <video className={postImg} autoPlay loop muted playsInline>
                        <source src={`data:video/*;base64,${video.base64}`} type="video/mp4" />
                        Your browser does not support the video tag.
                    </video>
                </>
            )
        }
    }

    function poster<T extends PostType>(post: Extract<proto.Post, { type: T }>) {
        return Poster[post.type](post)
    }

    if (payloads.length === 0) return <div className={muted}>No posts yet — add one to your brand.yml.</div>

    return (
        <div className={postsGrid}>
            {payloads.map((payload) => {
                const { hash, post } = payload
                return (
                    <div key={hash} className={postCard}>
                        <div className={cx(row, align.center, gap.sm)}>
                            <div className={avatar} />
                            <div className={cx(col, gap.xs)}>
                                <span className={font.weight.medium}>You</span>
                                <span className={cx(muted, font.size.sm)}>
                                    {new Date(post.created).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                        {poster(post)}
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
