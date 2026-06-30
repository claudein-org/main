import { type Generated, Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { env } from './env'

const { DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME } = env
const dialect = new PostgresDialect({
    pool: new Pool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASS,
        database: DB_NAME,
        ssl: {
            rejectUnauthorized: false
        },
    }),
})

namespace db {
    interface Users {
        user_id: Generated<number>
        email: string
    }

    interface Linkedin {
        user_id: number
        access_token: string
        expires_at: number
        author_urn: string
    }

    interface Facebook {
        user_id: number
        page_id: string
        page_name: string
        access_token: string
    }

    interface Instagram {
        user_id: number
        instagram_account_id: string
        username: string
        access_token: string
        expires_at: number
    }

    interface Devto {
        user_id: number
        api_key: string
        devto_user_id: string
    }

    interface Youtube {
        user_id: number
        channel_id: string
        channel_title: string
        channel_thumbnail: string
        access_token: string
        refresh_token: string
        expires_at: number
    }

    interface InstagramContainers {
        container_id: Generated<number>
        user_id: number
        post_id: string
        creation_id: string
        status: number
        error_message: string | null
        created_at: Generated<Date>
        updated_at: Generated<Date>
    }

    interface PublishedPosts {
        id: Generated<number>
        user_id: number
        provider: number
        account_id: string
        provider_post_id: string
        local_post_id: string | null
        origin: number
        post_url: string
        post_date: Generated<Date>
        synced_at: Date | null
    }

    interface PostMetrics {
        published_post_id: number
        captured_on: Date
        impressions: number | null
        reach: number | null
        reactions: number | null
        comments: number | null
        shares: number | null
        saves: number | null
        clicks: number | null
        extra: Record<string, unknown> | null
        updated_at: Generated<Date>
    }

    export interface DB {
        users: Users
        linkedin: Linkedin
        facebook: Facebook
        instagram: Instagram
        devto: Devto
        youtube: Youtube
        instagram_containers: InstagramContainers
        published_posts: PublishedPosts
        post_metrics: PostMetrics
    }
}

export const db = new Kysely<db.DB>({ dialect })


if (import.meta.main) {
    const res = await db.selectFrom('users').selectAll().execute()
    console.log(res)
    process.exit(0)
}