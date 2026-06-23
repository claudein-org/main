'use server'

import { cook } from "@/lib/cookie"
import { db } from "@/lib/db"
import { linkedin } from "@/lib/linkedin"
import { proto } from "@claudein.org/common"
import assert from "assert"

const MIN_MS = 1000 * 60
export async function post(raw: proto.Post) {
    const post = proto.Post.parse(raw)

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

    await db
        .insertInto('posts')
        .values({ post_urn: urn, user_id, post_id: post.post_id })
        .execute()

    return { urn }
}