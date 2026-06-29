'use client'
import { align, col, gap, row } from "@/css/layout.css"
import { articleBody, articleCard, articlesGrid, avatar, font, muted } from "@/css/style.css"
import { cx } from "@/styled-system/css"
import { proto } from "@claudein.org/common"
import Markdown from "react-markdown"

interface Props {
    payloads: proto.Payloads
}

export default function ArticlesView({ payloads }: Props) {
    if (payloads.length === 0) {
        return <div className={muted}>No articles yet — add an article post pointing to a .md file in your brand.yml.</div>
    }

    return (
        <div className={articlesGrid}>
            {payloads.map(({ hash, post }) => post.type === 'article' && (
                <div key={hash} className={articleCard}>
                    <div className={cx(row, align.center, gap.sm)}>
                        <div className={avatar} />
                        <div className={cx(col, gap.xs)}>
                            <span className={font.weight.medium}>You</span>
                            <span className={cx(muted, font.size.sm)}>
                                {new Date(post.created).toLocaleDateString()}
                            </span>
                        </div>
                    </div>
                    <div className={articleBody}>
                        <Markdown>{post.markdown}</Markdown>
                    </div>
                </div>
            ))}
        </div>
    )
}
