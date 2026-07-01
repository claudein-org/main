import type { Page } from "@/provider/facebook"
import type { Account } from "@/provider/instagram"
import type { Channel } from "@/provider/youtube"
import { Platform, PlatformSupport, proto } from "@claudein.org/common"

// published[hash][provider][account_id] = post_url. Populated from the DB on
// page load and merged with any posts made during this session (see
// mergePublished) so status stays live without a refetch.
export type PublishedMap = Record<string, Record<number, Record<string, string>>>

export type ProviderColor = 'linkedin' | 'facebook' | 'instagram' | 'youtube' | 'devto'

export interface ProviderAccountStatus {
    id: string
    label: string
    url?: string
    avatar?: string
}

export interface ProviderStatus {
    provider: number
    name: string
    color: ProviderColor
    posted: boolean
    accounts: ProviderAccountStatus[]
}

export interface Connections {
    linkedinConnected: boolean
    facebookPages: Page[]
    instagramAccounts: Account[]
    youtubeConnected: boolean
    youtubeChannels: Channel[]
    devtoConnected: boolean
}

const SELF_ACCOUNT = 'self'

function applicable(asset: proto.Payload['asset'], platform: keyof typeof PlatformSupport) {
    return asset.target.includes(platform) && PlatformSupport[platform].includes(asset.type)
}

// The providers a payload can go to, given who's connected — each with its
// posted/pending accounts. A provider counts as "posted" once at least one of
// its accounts has a URL; the others remain individually postable.
export function providerStatuses(payload: proto.Payload, published: PublishedMap, conn: Connections): ProviderStatus[] {
    const { hash, asset } = payload
    const byProvider = published[hash] ?? {}
    const statuses: ProviderStatus[] = []

    if (conn.linkedinConnected && applicable(asset, 'LinkedIn')) {
        const url = Object.values(byProvider[Platform.LinkedIn] ?? {})[0]
        statuses.push({
            provider: Platform.LinkedIn, name: 'LinkedIn', color: 'linkedin',
            posted: !!url, accounts: [{ id: SELF_ACCOUNT, label: 'LinkedIn', url }],
        })
    }
    if (conn.facebookPages.length > 0 && applicable(asset, 'Facebook')) {
        const byAccount = byProvider[Platform.Facebook] ?? {}
        const accounts = conn.facebookPages.map(p => ({ id: p.page_id, label: p.page_name, url: byAccount[p.page_id] }))
        statuses.push({ provider: Platform.Facebook, name: 'Facebook', color: 'facebook', posted: accounts.some(a => !!a.url), accounts })
    }
    if (conn.instagramAccounts.length > 0 && applicable(asset, 'Instagram')) {
        const byAccount = byProvider[Platform.Instagram] ?? {}
        const accounts = conn.instagramAccounts.map(a => ({ id: a.instagram_account_id, label: `@${a.username}`, url: byAccount[a.instagram_account_id] }))
        statuses.push({ provider: Platform.Instagram, name: 'Instagram', color: 'instagram', posted: accounts.some(a => !!a.url), accounts })
    }
    if (conn.youtubeChannels.length > 0 && applicable(asset, 'YouTube')) {
        const byAccount = byProvider[Platform.YouTube] ?? {}
        const accounts = conn.youtubeChannels.map(c => ({ id: c.channel_id, label: c.title, url: byAccount[c.channel_id], avatar: c.thumbnail }))
        statuses.push({ provider: Platform.YouTube, name: 'YouTube', color: 'youtube', posted: accounts.some(a => !!a.url), accounts })
    }
    if (conn.devtoConnected && applicable(asset, 'DEV.to')) {
        const url = Object.values(byProvider[Platform['DEV.to']] ?? {})[0]
        statuses.push({
            provider: Platform['DEV.to'], name: 'dev.to', color: 'devto',
            posted: !!url, accounts: [{ id: SELF_ACCOUNT, label: 'dev.to', url }],
        })
    }
    return statuses
}

// A card still needs attention if any applicable provider hasn't been posted
// to yet. Cards with no applicable (connected + targeted) provider have
// nothing left to do, so they don't count as pending.
export function isCardPending(statuses: ProviderStatus[]): boolean {
    return statuses.some(s => !s.posted)
}

// Merges session-posted overrides (from posting during this visit) over the
// server-loaded published map so status updates immediately without a refetch.
export function mergePublished(base: PublishedMap, overrides: PublishedMap): PublishedMap {
    if (Object.keys(overrides).length === 0) return base
    const result: PublishedMap = { ...base }
    for (const hash of Object.keys(overrides)) {
        result[hash] = { ...result[hash] }
        for (const [provider, accounts] of Object.entries(overrides[hash]!)) {
            result[hash]![Number(provider)] = { ...result[hash]![Number(provider)], ...accounts }
        }
    }
    return result
}

export const selfAccountId = SELF_ACCOUNT
