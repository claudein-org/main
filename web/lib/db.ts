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
        access_token: string
        expires_at: number
        facebook_user_id: string
    }

    interface Instagram {
        user_id: number
        access_token: string
        expires_at: number
        instagram_account_id: string
    }

    interface Youtube {
        user_id: number
        access_token: string
        refresh_token: string
        expires_at: number
        channel_id: string
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

    interface Posts {
        post_date: Generated<Date>
        user_id: number
        post_id: string
        provider: number
        post_url: string
    }

    export interface DB {
        users: Users
        linkedin: Linkedin
        facebook: Facebook
        instagram: Instagram
        youtube: Youtube
        instagram_containers: InstagramContainers
        posts: Posts
    }
}

export const db = new Kysely<db.DB>({ dialect })


if (import.meta.main) {
    const res = await db.selectFrom('users').selectAll().execute()
    console.log(res)
    process.exit(0)
}