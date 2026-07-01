// Assets carry a `schedule` date (YYYY-MM-DD, local time — see common's
// yml.BaseAsset). The sidebar's Today / Next 7 Days / Next 30 Days tabs are
// cumulative windows: each includes everything due in the narrower windows
// plus anything already past due, matching Today/Next-7/Next-30 conventions
// elsewhere (e.g. Todoist).
export type Window = 'today' | 'next7' | 'next30'

const WINDOW_DAYS: Record<Window, number> = { today: 0, next7: 7, next30: 30 }

const ONE_DAY_MS = 24 * 60 * 60 * 1000

const DATE_FORMATTER = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
})

export function dateStr(when: number | Date): string {
    return DATE_FORMATTER.format(when)
}

// `now` is a timestamp (ms) so callers can pass a value that only updates
// periodically, rather than a fresh `Date.now()` on every render.
export function inWindow(schedule: string, window: Window, now: number): boolean {
    const cutoff = dateStr(now + WINDOW_DAYS[window] * ONE_DAY_MS)
    return schedule <= cutoff
}
