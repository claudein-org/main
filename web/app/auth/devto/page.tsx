import LoginPage from "@/component/LoginPage"
import { col, gap, pageCentered, width } from "@/css/layout.css"
import { btn, color, errorText, font } from "@/css/style.css"
import { app } from "@/lib/app"
import { cook } from "@/lib/cookie"
import { db } from "@/lib/db"
import { cx } from "@/styled-system/css"
import assert from "assert"
import ky from "ky"
import { redirect } from "next/navigation"
import z from "zod"

// dev.to has no OAuth flow — the user pastes a personal API key generated at
// dev.to → Settings → Extensions. We validate it against /api/users/me, store
// it, then close the popup (same as the OAuth callbacks redirecting to /close).
const Me = z.object({ id: z.number().int(), username: z.string() })

const ERRORS: Record<string, string> = {
  missing_key: "Please paste your dev.to API key.",
  invalid_key: "That API key didn't work — double-check it and try again.",
}

type Props = { searchParams: Promise<{ error?: string }> }

export default async function page({ searchParams }: Props) {
  const { user_id } = await cook.get()
  if (!user_id) return <LoginPage />

  const { error } = await searchParams

  async function connect(formData: FormData) {
    'use server'

    const { user_id } = await cook.get()
    assert(user_id, 'User not authenticated')

    const api_key = String(formData.get('api_key') ?? '').trim()
    if (!api_key) redirect(`${app.auth.devto}?error=missing_key`)

    const me = await ky
      .get('https://dev.to/api/users/me', {
        headers: { 'api-key': api_key, accept: 'application/vnd.forem.api-v1+json' },
        throwHttpErrors: false,
      })
      .json()
      .catch(() => null)

    const parsed = Me.safeParse(me)
    if (!parsed.success) redirect(`${app.auth.devto}?error=invalid_key`)

    const devto_user_id = String(parsed.data.id)

    await db
      .insertInto('devto')
      .values({ user_id, api_key, devto_user_id })
      .onConflict((oc) => oc.column('user_id').doUpdateSet({ api_key, devto_user_id }))
      .execute()

    redirect(app.close)
  }

  return (
    <main className={pageCentered}>
      <form action={connect} className={cx(col, gap.md, width[400])}>
        <h1 className={cx(font.size.xl, font.weight.bold)}>Connect dev.to</h1>
        <p className={color.muted}>
          Generate a key under{' '}
          <a className={color.claude} href="https://dev.to/settings/extensions" target="_blank" rel="noreferrer">
            dev.to → Settings → Extensions → DEV API Keys
          </a>
          , then paste it below.
        </p>
        <label htmlFor="api_key">dev.to API key</label>
        <input id="api_key" name="api_key" type="password" autoComplete="off" required placeholder="paste your API key" />
        {error && <span className={errorText}>{ERRORS[error] ?? 'Something went wrong.'}</span>}
        <button className={cx(btn({ color: 'devto' }))} type="submit">Connect dev.to</button>
      </form>
    </main>
  )
}
