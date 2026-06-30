'use client'

import {
    analyticsHeader,
    analyticsPage,
    brandEmpty,
    chartFrame,
    chartLegend,
    chartSvg,
    font,
    leaderboard,
    leaderEngagement,
    leaderRank,
    leaderRow,
    leaderUrl,
    legendItem,
    metricCard,
    metricGrid,
    metricLabel,
    metricValue,
    muted,
    providerCard,
    providerGrid,
    providerHead,
    providerName,
    providerNote,
    providerStat,
    providerStatRow,
    providerSwatch,
    sectionTitle,
} from "@/css/style.css"
import type { Analytics } from "@/server/analytics"
import { cx } from "@/styled-system/css"
import { Platform } from "@claudein.org/common"

type SwatchColor = 'linkedin' | 'facebook' | 'instagram' | 'youtube' | 'devto'

const PROVIDERS: { id: number; name: string; color: SwatchColor }[] = [
    { id: Platform.LinkedIn, name: 'LinkedIn', color: 'linkedin' },
    { id: Platform.Facebook, name: 'Facebook', color: 'facebook' },
    { id: Platform.Instagram, name: 'Instagram', color: 'instagram' },
    { id: Platform.YouTube, name: 'YouTube', color: 'youtube' },
    { id: Platform['DEV.to'], name: 'dev.to', color: 'devto' },
]

const IMPRESSIONS_COLOR = '#d97757' // claude
const ENGAGEMENT_COLOR = '#0a66c2'  // linkedin

const PROVIDER_COLORS: Record<number, string> = {
    [Platform.LinkedIn]: '#0a66c2',
    [Platform.Facebook]: '#1877F2',
    [Platform.Instagram]: '#E1306C',
    [Platform.YouTube]: '#FF0000',
    [Platform['DEV.to']]: '#0A0A0A',
}

const nf = new Intl.NumberFormat()
const fmt = (n: number) => nf.format(n)

interface Props {
    analytics: Analytics
    connected: Record<number, boolean>
}

export default function AnalyticsView({ analytics, connected }: Props) {
    const { totals, trend, topPosts, perProvider, postsByDay } = analytics

    return (
        <div className={analyticsPage}>
            <div className={analyticsHeader}>
                <h1 className={cx(font.size.xl, font.weight.bold)}>Analytics</h1>
                <span className={cx(muted, font.size.sm)}>{analytics.from} – {analytics.to}</span>
            </div>

            {totals.postCount === 0 && (
                <div className={brandEmpty}>
                    No metrics yet. Numbers appear here after your posts are published and the daily
                    sync pulls their stats from each provider.
                </div>
            )}

            <div className={metricGrid}>
                <Metric label="Impressions" value={totals.impressions} />
                <Metric label="Reach" value={totals.reach} />
                <Metric label="Engagement" value={totals.engagement} />
                <Metric label="Posts tracked" value={totals.postCount} />
            </div>

            {postsByDay.length > 0 && (
                <section>
                    <div className={sectionTitle}>Posts published</div>
                    <div className={chartFrame}>
                        <PostsBarChart postsByDay={postsByDay} from={analytics.from} to={analytics.to} />
                        <div className={chartLegend}>
                            {PROVIDERS.map(prov => (
                                <span key={prov.id} className={legendItem}>
                                    <span className={providerSwatch({ color: prov.color })} />
                                    {prov.name}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {trend.length >= 2 && (
                <section>
                    <div className={sectionTitle}>Trend</div>
                    <div className={chartFrame}>
                        <TrendChart trend={trend} />
                        <div className={chartLegend}>
                            <span className={legendItem}>
                                <Dot color={IMPRESSIONS_COLOR} /> Impressions
                            </span>
                            <span className={legendItem}>
                                <Dot color={ENGAGEMENT_COLOR} /> Engagement
                            </span>
                        </div>
                    </div>
                </section>
            )}

            {topPosts.length > 0 && (
                <section>
                    <div className={sectionTitle}>Top posts</div>
                    <div className={leaderboard}>
                        {topPosts.map((p, i) => (
                            <a key={p.published_post_id} className={leaderRow} href={p.post_url} target="_blank" rel="noreferrer">
                                <span className={leaderRank}>{i + 1}</span>
                                <ProviderSwatch provider={p.provider} />
                                <span className={leaderUrl}>{prettyUrl(p.post_url)}</span>
                                <span className={leaderEngagement}>{fmt(p.engagement)}</span>
                            </a>
                        ))}
                    </div>
                </section>
            )}

            <section>
                <div className={sectionTitle}>By provider</div>
                <div className={providerGrid}>
                    {PROVIDERS.map((prov) => (
                        <ProviderCard
                            key={prov.id}
                            name={prov.name}
                            color={prov.color}
                            connected={connected[prov.id] ?? false}
                            summary={perProvider[prov.id]}
                        />
                    ))}
                </div>
            </section>
        </div>
    )
}

function Metric({ label, value }: { label: string; value: number }) {
    return (
        <div className={metricCard}>
            <span className={metricValue}>{fmt(value)}</span>
            <span className={metricLabel}>{label}</span>
        </div>
    )
}

function ProviderCard({ name, color, connected, summary }: {
    name: string
    color: SwatchColor
    connected: boolean
    summary: Props['analytics']['perProvider'][number] | undefined
}) {
    const hasAccess = summary?.hasAnalyticsAccess ?? false
    return (
        <div className={providerCard}>
            <div className={providerHead}>
                <span className={providerSwatch({ color })} />
                <span className={providerName}>{name}</span>
            </div>

            {!connected ? (
                <p className={providerNote}>Not connected.</p>
            ) : !hasAccess ? (
                // Honest "scope-gated" state — never fake zeros (plan.v1.md §6.3).
                <p className={providerNote}>Connect analytics access to see metrics here.</p>
            ) : (
                <div className={providerStat}>
                    <div className={providerStatRow}><span>Impressions</span><span>{fmt(summary?.totals.impressions ?? 0)}</span></div>
                    <div className={providerStatRow}><span>Engagement</span><span>{fmt(summary?.totals.engagement ?? 0)}</span></div>
                    <div className={providerStatRow}><span>Posts</span><span>{fmt(summary?.totals.postCount ?? 0)}</span></div>
                </div>
            )}
        </div>
    )
}

function ProviderSwatch({ provider }: { provider: number }) {
    const prov = PROVIDERS.find((p) => p.id === provider)
    if (!prov) return null
    return <span className={providerSwatch({ color: prov.color })} />
}

function Dot({ color }: { color: string }) {
    // Legend swatch — color is data-driven (the chart's two series), so it rides
    // an SVG presentation attribute rather than a CSS class.
    return <svg width="10" height="10" viewBox="0 0 10 10" aria-hidden><circle cx="5" cy="5" r="5" fill={color} /></svg>
}

/**
 * Inline SVG sparkline of the two series — keeps the bundle dependency-free
 * (plan.v1.md §6.3). Both lines are scaled to a shared max so their relative
 * magnitude reads true.
 */
function TrendChart({ trend }: { trend: Analytics['trend'] }) {
    const W = 720
    const H = 160
    const pad = 4
    const max = Math.max(1, ...trend.map((t) => Math.max(t.impressions, t.engagement)))
    const n = trend.length
    const x = (i: number) => (n === 1 ? W / 2 : pad + (i * (W - 2 * pad)) / (n - 1))
    const y = (v: number) => H - pad - (v / max) * (H - 2 * pad)
    const path = (key: 'impressions' | 'engagement') =>
        trend.map((t, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(t[key]).toFixed(1)}`).join(' ')

    return (
        <svg className={chartSvg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Impressions and engagement trend">
            <path d={path('impressions')} fill="none" stroke={IMPRESSIONS_COLOR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
            <path d={path('engagement')} fill="none" stroke={ENGAGEMENT_COLOR} strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
        </svg>
    )
}

function PostsBarChart({ postsByDay, from, to }: {
    postsByDay: Analytics['postsByDay']
    from: string
    to: string
}) {
    const W = 720
    const H = 120
    const providerOrder = PROVIDERS.map(p => p.id)

    const days: string[] = []
    const d = new Date(from + 'T00:00:00Z')
    const end = new Date(to + 'T00:00:00Z')
    while (d <= end) {
        days.push(d.toISOString().slice(0, 10))
        d.setUTCDate(d.getUTCDate() + 1)
    }

    const byDay = new Map(postsByDay.map(p => [p.day, p.counts]))
    const maxTotal = Math.max(1, ...days.map(day => {
        const c = byDay.get(day) ?? {}
        return Object.values(c).reduce((a, b) => a + b, 0)
    }))

    const barSlotW = W / days.length
    const barGap = 1
    const barInnerW = barSlotW - barGap

    return (
        <svg className={chartSvg} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none"
            role="img" aria-label="Posts published per day by provider">
            {days.map((day, i) => {
                const counts = byDay.get(day) ?? {}
                const total = Object.values(counts).reduce((a, b) => a + b, 0)
                if (!total) return null

                const x = i * barSlotW + barGap / 2
                let y = H
                const segs: { pid: number; sy: number; h: number }[] = []
                for (const pid of providerOrder) {
                    const count = counts[pid] ?? 0
                    if (!count) continue
                    const h = (count / maxTotal) * H
                    y -= h
                    segs.push({ pid, sy: y, h })
                }

                return (
                    <g key={day}>
                        <title>{day}: {total} post{total !== 1 ? 's' : ''}</title>
                        {segs.map(({ pid, sy, h }) => (
                            <rect key={pid}
                                x={x.toFixed(2)} y={sy.toFixed(2)}
                                width={barInnerW.toFixed(2)} height={h.toFixed(2)}
                                fill={PROVIDER_COLORS[pid] ?? '#999'}
                            />
                        ))}
                    </g>
                )
            })}
        </svg>
    )
}

function prettyUrl(url: string) {
    try {
        const u = new URL(url)
        return u.host + u.pathname
    } catch {
        return url
    }
}
