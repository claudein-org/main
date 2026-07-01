'use client'
import { align, gap, row } from "@/css/layout.css"
import { btn, postCardActions, providerActionAccounts, providerActionGroup, providerActionHeader, providerActionName, statusPill, ytAvatar } from "@/css/style.css"
import { providerStatuses, type Connections, type PublishedMap } from "@/lib/postStatus"
import { postToDevto, postToFacebook, postToInstagram, postToLinkedin, postToYoutube } from "@/server/post"
import { cx } from "@/styled-system/css"
import { Platform, proto } from "@claudein.org/common"
import { useState } from "react"

interface Props {
    payload: proto.Payload
    published: PublishedMap
    connections: Connections
    onPosted: (hash: string, provider: number, accountId: string, url: string) => void
}

// Publish buttons shared by post/media/article cards, grouped by provider so
// a provider reads as posted once any one of its accounts has gone out, while
// the rest stay individually postable. Status comes entirely from `published`
// (lifted to Dashboard) so it updates immediately after a successful post.
export default function PostActions({ payload, published, connections, onPosted }: Props) {
    const { hash, asset } = payload
    const [posting, setPosting] = useState<Set<string>>(new Set())
    const [failed, setFailed] = useState<Record<string, string>>({})

    function trackPosting(key: string) {
        setPosting(prev => new Set(prev).add(key))
        setFailed(prev => {
            if (!(key in prev)) return prev
            const next = { ...prev }
            delete next[key]
            return next
        })
        return () => setPosting(prev => { const s = new Set(prev); s.delete(key); return s })
    }

    async function run(key: string, provider: number, accountId: string, action: () => Promise<{ url: string } | undefined>) {
        const done = trackPosting(key)
        try {
            const res = await action()
            if (!res) return
            onPosted(hash, provider, accountId, res.url)
        } catch (err) {
            setFailed(prev => ({ ...prev, [key]: err instanceof Error ? err.message : 'Failed to post' }))
        } finally { done() }
    }

    function handlePost(provider: number, accountId: string) {
        const key = `${provider}:${accountId}`
        switch (provider) {
            case Platform.LinkedIn: return run(key, provider, accountId, () => postToLinkedin({ hash, asset }))
            case Platform['DEV.to']: return run(key, provider, accountId, () => postToDevto({ hash, asset }))
            case Platform.Facebook: return run(key, provider, accountId, () => postToFacebook({ hash, asset }, accountId))
            case Platform.Instagram: return run(key, provider, accountId, () => postToInstagram({ hash, asset }, accountId))
            case Platform.YouTube: return run(key, provider, accountId, () => postToYoutube({ hash, asset }, accountId))
        }
    }

    const statuses = providerStatuses(payload, published, connections)

    return (
        <div className={postCardActions}>
            {statuses.map(status => (
                <div key={status.provider} className={providerActionGroup}>
                    <div className={providerActionHeader}>
                        <span className={providerActionName}>{status.name}</span>
                        <span className={statusPill({ tone: status.posted ? 'posted' : 'pending' })}>
                            {status.posted ? 'Posted' : 'Pending'}
                        </span>
                    </div>
                    <div className={providerActionAccounts}>
                        {status.accounts.map(account => {
                            const key = `${status.provider}:${account.id}`
                            const isPosting = posting.has(key)
                            const error = failed[key]
                            const singleAccount = status.accounts.length === 1

                            if (account.url) {
                                return (
                                    <a key={account.id} href={account.url} target="_blank" rel="noopener noreferrer"
                                        className={cx(btn({ color: status.color, size: 'sm' }))} title={account.label}>
                                        View on {status.name}
                                    </a>
                                )
                            }

                            const label = isPosting ? 'Posting…' : error ? 'Retry' : singleAccount ? 'Post' : account.label

                            return (
                                <span key={account.id} className={cx(row, align.center, gap.xs)}>
                                    {error && <span className={statusPill({ tone: 'failed' })} title={error}>Failed</span>}
                                    <button
                                        className={btn({ color: status.color, size: 'sm' })}
                                        onClick={() => handlePost(status.provider, account.id)}
                                        disabled={isPosting}
                                        title={error ?? account.label}
                                    >
                                        {account.avatar
                                            ? <span className={cx(row, align.center, gap.xs)}>
                                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                                <img className={ytAvatar} src={account.avatar} alt="" />
                                                <span>{label}</span>
                                            </span>
                                            : label}
                                    </button>
                                </span>
                            )
                        })}
                    </div>
                </div>
            ))}
        </div>
    )
}
