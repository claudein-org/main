import { Generated, Kysely, PostgresDialect } from 'kysely'
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
    }

    interface Posts {
        user_id: number
        post_id: number
        post_date: Generated<Date>
        link: string
    }

    export interface DB {
        users: Users
        linkedin: Linkedin
        posts: Posts
    }
}

export const db = new Kysely<db.DB>({ dialect })


if (import.meta.main) {
    const res = await db.selectFrom('users').selectAll().execute()
    console.log(res)
    process.exit(0)
}