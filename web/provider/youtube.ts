import { db } from '@/lib/db'
import { env } from '@/lib/env'
import { GOOGLE_CLIENT_ID } from '@/lib/settings'
import ky from 'ky'
import z from 'zod'

const RefreshedToken = z.object({
    access_token: z.string(),
    expires_in: z.number().int(),
})

const FIVE_MINUTES = 5 * 60

async function refreshedToken(user_id: number) {
    const now = Math.floor(Date.now() / 1000)
    const row = await db
        .selectFrom('youtube')
        .select(['access_token', 'refresh_token', 'expires_at'])
        .where('user_id', '=', user_id)
        .executeTakeFirst()

    if (!row) return null

    if (row.expires_at - now < FIVE_MINUTES) {
        try {
            const res = await ky.post('https://oauth2.googleapis.com/token', {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'refresh_token',
                    refresh_token: row.refresh_token,
                    client_id: GOOGLE_CLIENT_ID,
                    client_secret: env.GOOGLE_CLIENT_SECRET,
                }),
            }).json()

            const { access_token, expires_in } = RefreshedToken.parse(res)
            const expires_at = now + expires_in

            await db
                .updateTable('youtube')
                .set({ access_token, expires_at })
                .where('user_id', '=', user_id)
                .execute()

            return access_token
        } catch {
            return null
        }
    }

    return row.access_token
}

export async function getStatus(user_id: number) {
    const token = await refreshedToken(user_id)
    return { connected: token !== null }
}

export interface VideoUploadOptions {
    // snippet
    title: string
    description?: string
    tags?: string[]
    categoryId?: string
    defaultLanguage?: string
    defaultAudioLanguage?: string
    // status
    privacyStatus?: 'public' | 'private' | 'unlisted'
    embeddable?: boolean
    license?: 'youtube' | 'creativeCommon'
    publicStatsViewable?: boolean
    publishAt?: string          // ISO 8601 — schedules the video; requires privacyStatus 'private'
    selfDeclaredMadeForKids?: boolean
    // recordingDetails
    recordingDate?: string      // ISO 8601 date
    location?: {
        latitude: number
        longitude: number
        altitude?: number
    }
    locationDescription?: string
    // localizations: BCP-47 language tag → localized title + description
    localizations?: Record<string, { title: string; description: string }>
    // upload query params
    notifySubscribers?: boolean
}

const UploadResponse = z.object({ id: z.string() })

export async function upload(user_id: number, video: Blob, options: VideoUploadOptions) {
    const access_token = await refreshedToken(user_id)
    if (!access_token) throw new Error('YouTube not connected')

    const parts = ['snippet', 'status']

    const metadata: Record<string, unknown> = {
        snippet: {
            title: options.title,
            description: options.description,
            tags: options.tags,
            categoryId: options.categoryId,
            defaultLanguage: options.defaultLanguage,
            defaultAudioLanguage: options.defaultAudioLanguage,
        },
        status: {
            privacyStatus: options.privacyStatus ?? 'private',
            embeddable: options.embeddable,
            license: options.license,
            publicStatsViewable: options.publicStatsViewable,
            publishAt: options.publishAt,
            selfDeclaredMadeForKids: options.selfDeclaredMadeForKids,
        },
    }

    if (options.recordingDate || options.location || options.locationDescription) {
        parts.push('recordingDetails')
        metadata.recordingDetails = {
            recordingDate: options.recordingDate,
            location: options.location,
            locationDescription: options.locationDescription,
        }
    }

    if (options.localizations) {
        parts.push('localizations')
        metadata.localizations = options.localizations
    }

    const searchParams: Record<string, string> = {
        uploadType: 'resumable',
        part: parts.join(','),
    }
    if (options.notifySubscribers !== undefined) {
        searchParams.notifySubscribers = String(options.notifySubscribers)
    }

    // Initiate resumable upload session
    const initRes = await ky.post('https://www.googleapis.com/upload/youtube/v3/videos', {
        searchParams,
        headers: {
            Authorization: `Bearer ${access_token}`,
            'X-Upload-Content-Type': video.type || 'video/mp4',
            'X-Upload-Content-Length': String(video.size),
        },
        json: metadata,
    })

    const uploadUrl = initRes.headers.get('Location')
    if (!uploadUrl) throw new Error('YouTube did not return an upload URL')

    // Upload video bytes
    const uploadRes = await ky.put(uploadUrl, {
        headers: {
            'Content-Type': video.type || 'video/mp4',
            'Content-Length': String(video.size),
        },
        body: video,
    })

    const { id } = UploadResponse.parse(await uploadRes.json())
    return { id }
}
