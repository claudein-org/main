'use server'

import { cook } from "@/lib/cookie"
import { db } from "@/lib/db"
import { linkedin } from "@/lib/linkedin"
import { deleteMedia, storeMedia } from "@/lib/media-store"
import * as instagram from "@/provider/instagram"
import * as youtube from "@/provider/youtube"
import { Platform, PlatformSupport, proto } from "@claudein.org/common"
import assert from "assert"
import { randomBytes } from "crypto"
import ky from "ky"
import z from "zod"

const MIN_MS = 1000 * 60

// Records a published item in published_posts. The unique key
// (user_id, provider, account_id, provider_post_id) makes this idempotent, so
// re-publishing the same content to the same account updates rather than errors.
async function publish(row: {
    user_id: number
    provider: number
    account_id: string
    provider_post_id: string
    local_post_id: string
    post_url: string
}) {
    await db
        .insertInto('published_posts')
        .values({ ...row, origin: 1 })
        .onConflict((oc) => oc
            .columns(['user_id', 'provider', 'account_id', 'provider_post_id'])
            .doUpdateSet({ post_url: row.post_url, local_post_id: row.local_post_id }))
        .execute()
}

export async function postToLinkedin(raw: proto.Payload) {
    const { hash, asset } = proto.Payload.parse(raw)

    const { user_id } = await cook.get()

    assert(user_id, 'User not logged in')

    const { access_token, expires_at, author_urn } = await db
        .selectFrom('linkedin')
        .select(['access_token', 'expires_at', 'author_urn'])
        .where('user_id', '=', user_id)
        .executeTakeFirstOrThrow()

    assert(expires_at > Date.now() / 1000 + MIN_MS, 'Linkedin access token expired')

    const { urn } = await linkedin.post({ access_token, author_urn }, asset)

    if (!urn) return

    const post_url = `https://www.linkedin.com/feed/update/${urn}`

    await publish({
        user_id,
        provider: Platform.LinkedIn,
        account_id: author_urn,
        provider_post_id: urn,
        local_post_id: hash,
        post_url,
    })

    return { url: post_url }
}

export async function postToInstagram(raw: proto.Payload, instagram_account_id: string) {
    const { hash, asset } = proto.Payload.parse(raw)

    if (asset.type !== 'image' && asset.type !== 'video') throw new Error('Instagram requires an image or video post')

    const { user_id } = await cook.get()
    assert(user_id, 'User not logged in')

    const { access_token } = await db
        .selectFrom('instagram')
        .select(['access_token'])
        .where('user_id', '=', user_id)
        .where('instagram_account_id', '=', instagram_account_id)
        .executeTakeFirstOrThrow()

    const { url: post_url, media_id } = await instagram.upload({ access_token, instagram_account_id, user_id, post_id: hash }, asset)

    await publish({
        user_id,
        provider: Platform.Instagram,
        account_id: instagram_account_id,
        provider_post_id: media_id,
        local_post_id: hash,
        post_url,
    })

    return { url: post_url }
}

const DevtoArticle = z.object({ id: z.number(), url: z.string() })

export async function postToDevto(raw: proto.Payload) {
    const { hash, asset } = proto.Payload.parse(raw)
    if (!PlatformSupport['DEV.to'].includes(asset.type)) throw new Error(`dev.to does not support '${asset.type}' posts`)

    const { user_id } = await cook.get()
    assert(user_id, 'User not logged in')

    const { api_key, devto_user_id } = await db
        .selectFrom('devto')
        .select(['api_key', 'devto_user_id'])
        .where('user_id', '=', user_id)
        .executeTakeFirstOrThrow()

    const content = asset.type === 'post' ? asset.text
        : asset.type === 'article' ? asset.markdown
            : ''
    const headingMatch = content.match(/^#[ \t]+(.+)(\r?\n|$)/)
    const title = headingMatch
        ? headingMatch[1]!.trim()
        : (content.split('\n')[0]?.trim().slice(0, 100) || 'Post')
    const body_markdown = headingMatch ? content.slice(headingMatch[0].length).trimStart() : content

    const { id, url: post_url } = DevtoArticle.parse(
        await ky.post('https://dev.to/api/articles', {
            headers: { 'api-key': api_key, accept: 'application/vnd.forem.api-v1+json' },
            json: { article: { title, body_markdown, published: true } },
        }).json()
    )

    await publish({
        user_id,
        provider: Platform['DEV.to'],
        account_id: devto_user_id,
        provider_post_id: String(id),
        local_post_id: hash,
        post_url,
    })

    return { url: post_url }
}

export async function postToYoutube(raw: proto.Payload, channel_id: string) {
    const { hash, asset } = proto.Payload.parse(raw)

    assert(asset.type === 'video', 'YouTube requires a video post')
    assert(channel_id, 'No YouTube channel selected')

    const { user_id } = await cook.get()
    assert(user_id, 'User not logged in')

    const videoBlob = new Blob([Uint8Array.from(atob(asset.base64), c => c.charCodeAt(0))], { type: 'video/mp4' })

    const { id } = await youtube.upload(user_id, channel_id, videoBlob, {
        title: asset.title ?? 'Video',
        description: asset.description,
        privacyStatus: 'public',
    })

    const post_url = `https://www.youtube.com/watch?v=${id}`

    // account_id = channel_id, so posting the same video to another channel is a
    // distinct row rather than an overwrite.
    await publish({
        user_id,
        provider: Platform.YouTube,
        account_id: channel_id,
        provider_post_id: id,
        local_post_id: hash,
        post_url,
    })

    return { url: post_url }
}

const FbFeedResponse = z.object({ id: z.string() })
const FbPhotoResponse = z.object({ id: z.string(), post_id: z.string().optional() })

export async function postToFacebook(raw: proto.Payload, page_id: string) {
    const { hash, asset } = proto.Payload.parse(raw)
    if (!PlatformSupport.Facebook.includes(asset.type)) throw new Error(`Facebook does not support '${asset.type}' posts`)

    const { user_id } = await cook.get()
    assert(user_id, 'User not logged in')

    const { access_token } = await db
        .selectFrom('facebook')
        .select(['access_token'])
        .where('user_id', '=', user_id)
        .where('page_id', '=', page_id)
        .executeTakeFirstOrThrow()

    let post_url: string
    let provider_post_id: string

    if (asset.type === 'post') {
        const res = FbFeedResponse.parse(
            await ky.post(`https://graph.facebook.com/v21.0/${page_id}/feed`, {
                searchParams: { access_token, message: asset.text },
            }).json()
        )
        provider_post_id = res.id
        const [pid, nid] = res.id.split('_')
        post_url = `https://www.facebook.com/permalink.php?story_fbid=${nid}&id=${pid}`
    } else if (asset.type === 'image') {
        const id = randomBytes(16).toString('hex')
        const mediaUrl = await storeMedia(id, asset.base64, 'image/jpeg')
        try {
            const res = FbPhotoResponse.parse(
                await ky.post(`https://graph.facebook.com/v21.0/${page_id}/photos`, {
                    searchParams: { access_token, url: mediaUrl, caption: asset.description ?? '' },
                }).json()
            )
            const postRef = res.post_id ?? res.id
            provider_post_id = postRef
            const [pid, nid] = postRef.split('_')
            post_url = `https://www.facebook.com/permalink.php?story_fbid=${nid}&id=${pid}`
        } finally {
            await deleteMedia(id)
        }
    } else if (asset.type === 'video') {
        const videoData = Buffer.from(asset.base64, 'base64')
        const fileSize = videoData.length

        // Phase 1: start upload session — params go in the POST body, not query string
        const StartRes = z.object({
            upload_session_id: z.string(),
            video_id: z.string(),
            start_offset: z.coerce.number(),
            end_offset: z.coerce.number(),
        })
        const startForm = new FormData()
        startForm.append('upload_phase', 'start')
        startForm.append('file_size', String(fileSize))
        const startJson = await ky.post(`https://graph.facebook.com/v21.0/${page_id}/videos`, {
            searchParams: { access_token },
            body: startForm,
            timeout: 30000,
            throwHttpErrors: false,
        }).json()
        const startParsed = StartRes.safeParse(startJson)
        if (!startParsed.success) throw new Error(`Facebook video start failed: ${JSON.stringify(startJson)}`)
        const session = startParsed.data

        // Phase 2: transfer (send all data in one or more chunks until Facebook says done)
        const TransferRes = z.object({ start_offset: z.coerce.number(), end_offset: z.coerce.number() })
        let { start_offset, end_offset } = session
        while (start_offset < fileSize) {
            const chunk = videoData.subarray(start_offset, end_offset)
            const form = new FormData()
            form.append('upload_phase', 'transfer')
            form.append('upload_session_id', session.upload_session_id)
            form.append('start_offset', String(start_offset))
            form.append('video_file_chunk', new Blob([chunk], { type: 'video/mp4' }), 'chunk')
            const next = TransferRes.parse(
                await ky.post(`https://graph.facebook.com/v21.0/${page_id}/videos`, {
                    searchParams: { access_token },
                    body: form,
                    timeout: 120000,
                }).json()
            )
            start_offset = next.start_offset
            end_offset = next.end_offset
        }

        // Phase 3: finish / publish — params in POST body
        const finishForm = new FormData()
        finishForm.append('upload_phase', 'finish')
        finishForm.append('upload_session_id', session.upload_session_id)
        finishForm.append('description', asset.description ?? '')
        if (asset.title) finishForm.append('title', asset.title)
        finishForm.append('published', 'true')
        await ky.post(`https://graph.facebook.com/v21.0/${page_id}/videos`, {
            searchParams: { access_token },
            body: finishForm,
            timeout: 30000,
        }).json()

        provider_post_id = session.video_id
        post_url = `https://www.facebook.com/watch/?v=${session.video_id}`
    } else {
        throw new Error('unreachable')
    }

    await publish({
        user_id,
        provider: Platform.Facebook,
        account_id: page_id,
        provider_post_id,
        local_post_id: hash,
        post_url,
    })

    return { url: post_url }
}