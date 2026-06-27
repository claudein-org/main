'use server'

import { cook } from "@/lib/cookie"
import { db } from "@/lib/db"
import { linkedin } from "@/lib/linkedin"
import * as instagram from "@/provider/instagram"
import * as youtube from "@/provider/youtube"
import { Platform, proto } from "@claudein.org/common"
import assert from "assert"

const MIN_MS = 1000 * 60
export async function postToLinkedin(raw: proto.Payload) {
    const { hash, post } = proto.Payload.parse(raw)

    const { user_id } = await cook.get()

    assert(user_id, 'User not logged in')

    const { access_token, expires_at, author_urn } = await db
        .selectFrom('linkedin')
        .select(['access_token', 'expires_at', 'author_urn'])
        .where('user_id', '=', user_id)
        .executeTakeFirstOrThrow()

    assert(expires_at > Date.now() / 1000 + MIN_MS, 'Linkedin access token expired')

    const { urn } = await linkedin.post({ access_token, author_urn }, post)

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

export async function postToInstagram(raw: proto.Payload) {
    const { hash, post } = proto.Payload.parse(raw)

    if (post.type !== 'media') throw new Error('Instagram requires a media post')

    const { user_id } = await cook.get()
    assert(user_id, 'User not logged in')

    const { access_token, instagram_account_id } = await db
        .selectFrom('instagram')
        .select(['access_token', 'instagram_account_id'])
        .where('user_id', '=', user_id)
        .executeTakeFirstOrThrow()

    const { url: post_url } = await instagram.upload({ access_token, instagram_account_id, user_id, post_id: hash }, post)

    await db
        .insertInto('posts')
        .values({ post_id: hash, post_url, provider: Platform.Instagram, user_id })
        .execute()

    return { url: post_url }
}

export async function postToYoutube(raw: proto.Payload) {
    const { hash, post } = proto.Payload.parse(raw)

    assert(post.type === 'media' && post.media.type === 'video', 'YouTube requires a video post')

    const { user_id } = await cook.get()
    assert(user_id, 'User not logged in')

    const { media } = post
    const videoBlob = new Blob([Uint8Array.from(atob(media.base64), c => c.charCodeAt(0))], { type: 'video/mp4' })

    const { id } = await youtube.upload(user_id, videoBlob, {
        title: media.title ?? 'Video',
        description: media.description,
        privacyStatus: 'public',
    })

    const post_url = `https://www.youtube.com/watch?v=${id}`

    await db
        .insertInto('posts')
        .values({ post_id: hash, post_url, provider: Platform.YouTube, user_id })
        .execute()

    return { url: post_url }
}