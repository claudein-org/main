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

    await db
        .insertInto('posts')
        .values({
            post_id: hash,
            post_url,
            provider: Platform.LinkedIn,
            user_id
        })
        .execute()

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

    const { url: post_url } = await instagram.upload({ access_token, instagram_account_id, user_id, post_id: hash }, asset)

    await db
        .insertInto('posts')
        .values({ post_id: hash, post_url, provider: Platform.Instagram, user_id })
        .execute()

    return { url: post_url }
}

const DevtoArticle = z.object({ url: z.string() })

export async function postToDevto(raw: proto.Payload) {
    const { hash, asset } = proto.Payload.parse(raw)
    if (!PlatformSupport['DEV.to'].includes(asset.type)) throw new Error(`dev.to does not support '${asset.type}' posts`)

    const { user_id } = await cook.get()
    assert(user_id, 'User not logged in')

    const { api_key } = await db
        .selectFrom('devto')
        .select(['api_key'])
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

    const { url: post_url } = DevtoArticle.parse(
        await ky.post('https://dev.to/api/articles', {
            headers: { 'api-key': api_key, accept: 'application/vnd.forem.api-v1+json' },
            json: { article: { title, body_markdown, published: true } },
        }).json()
    )

    await db
        .insertInto('posts')
        .values({ post_id: hash, post_url, provider: Platform['DEV.to'], user_id })
        .execute()

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

    // The posts table tracks one URL per (user, post, provider); re-posting to
    // another channel overwrites it rather than failing the unique constraint.
    await db
        .insertInto('posts')
        .values({ post_id: hash, post_url, provider: Platform.YouTube, user_id })
        .onConflict((oc) => oc.columns(['user_id', 'post_id', 'provider']).doUpdateSet({ post_url }))
        .execute()

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

    if (asset.type === 'post') {
        const res = FbFeedResponse.parse(
            await ky.post(`https://graph.facebook.com/v21.0/${page_id}/feed`, {
                searchParams: { access_token, message: asset.text },
            }).json()
        )
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

        post_url = `https://www.facebook.com/watch/?v=${session.video_id}`
    } else {
        throw new Error('unreachable')
    }

    await db
        .insertInto('posts')
        .values({ post_id: hash, post_url, provider: Platform.Facebook, user_id })
        .onConflict((oc) => oc.columns(['user_id', 'post_id', 'provider']).doUpdateSet({ post_url }))
        .execute()

    return { url: post_url }
}