import { db } from '@/lib/db'
import { deleteMedia, storeMedia } from '@/lib/media-store'
import { proto } from '@claudein.org/common'
import { randomBytes } from 'crypto'
import ky from 'ky'
import z from 'zod'

const SEVEN_DAYS = 7 * 24 * 60 * 60

const RefreshedToken = z.object({
    access_token: z.string(),
    expires_in: z.number().int(),
})

export async function getStatus(user_id: number) {
    const now = Math.floor(Date.now() / 1000)
    const row = await db
        .selectFrom('instagram')
        .select(['access_token', 'expires_at'])
        .where('user_id', '=', user_id)
        .executeTakeFirst()

    if (!row) return { connected: false }
    if (row.expires_at <= now) return { connected: false }

    // Proactively refresh if expiring within 7 days (long-lived tokens last 60 days)
    if (row.expires_at - now < SEVEN_DAYS) {
        try {
            const res = await ky.get('https://graph.instagram.com/refresh_access_token', {
                searchParams: {
                    grant_type: 'ig_refresh_token',
                    access_token: row.access_token,
                },
            }).json()

            const { access_token, expires_in } = RefreshedToken.parse(res)
            const expires_at = now + expires_in

            await db
                .updateTable('instagram')
                .set({ access_token, expires_at })
                .where('user_id', '=', user_id)
                .execute()
        } catch {
            // refresh failed — still valid until actual expiry
        }
    }

    return { connected: true }
}

const BASE = 'https://graph.instagram.com/v21.0'

const CreateContainerResponse = z.object({ id: z.string() })
const StatusResponse = z.object({
    status_code: z.string(),
    status: z.string().optional(),
    id: z.string().optional(),
})
const PublishResponse = z.object({ id: z.string() })
const PermalinkResponse = z.object({ permalink: z.string() })

async function waitForContainer(creation_id: string, access_token: string): Promise<void> {
    for (let i = 0; i < 30; i++) {
        await new Promise(r => setTimeout(r, 5000))
        const res = StatusResponse.parse(
            await ky.get(`${BASE}/${creation_id}`, {
                searchParams: { fields: 'status_code,status', access_token },
            }).json()
        )
        if (res.status_code === 'FINISHED') return
        if (res.status_code === 'ERROR') {
            throw new Error(`Instagram media processing failed: ${res.status ?? 'unknown reason'}`)
        }
    }
    throw new Error('Instagram media processing timed out')
}

interface Credentials {
    access_token: string
    instagram_account_id: string
    baseUrl: string
}

export async function upload(
    { access_token, instagram_account_id, baseUrl }: Credentials,
    post: Extract<proto.Post, { type: 'media' }>
) {
    const { media, text } = post
    const id = randomBytes(16).toString('hex')
    const contentType = media.type === 'image' ? 'image/jpeg' : 'video/mp4'

    storeMedia(id, media.base64, contentType)

    try {
        const mediaUrl = `${baseUrl}/api/media/${id}`
        const containerParams: Record<string, string> = {
            caption: text ?? '',
            access_token,
        }

        if (media.type === 'image') {
            containerParams.image_url = mediaUrl
        } else {
            containerParams.video_url = mediaUrl
            containerParams.media_type = 'REELS'
        }

        const { id: creation_id } = CreateContainerResponse.parse(
            await ky.post(`${BASE}/${instagram_account_id}/media`, {
                searchParams: containerParams,
            }).json()
        )

        if (media.type === 'video') {
            await waitForContainer(creation_id, access_token)
        }

        const { id: media_id } = PublishResponse.parse(
            await ky.post(`${BASE}/${instagram_account_id}/media_publish`, {
                searchParams: { creation_id, access_token },
            }).json()
        )

        const { permalink } = PermalinkResponse.parse(
            await ky.get(`${BASE}/${media_id}`, {
                searchParams: { fields: 'permalink', access_token },
            }).json()
        )

        return { url: permalink }
    } finally {
        deleteMedia(id)
    }
}
