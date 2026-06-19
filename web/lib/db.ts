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
    user_id: Generated<number>
    email: string
    api_key: string
}

interface LinkedinTable {
    user_id: number
    token: string
}

interface DB {
    users: UsersTable
    linkedin: LinkedinTable
}

export const db = new Kysely<DB>({ dialect })
