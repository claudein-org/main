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
    }),
})

interface UsersTable {
    id: Generated<string>
    google_id: string
    email: string
    linkedin_id: string | null
    linkedin_access_token: string | null
    api_key: string | null
    created_at: Generated<Date>
    updated_at: Generated<Date>
}

interface DB {
    users: UsersTable
}

export const db = new Kysely<DB>({ dialect })
