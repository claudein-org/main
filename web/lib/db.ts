import { Generated, Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { env } from './env'

const dialect = new PostgresDialect({
    pool: new Pool({ connectionString: env.DB_URL }),
})

interface UsersTable {
    id: Generated<string>
    linkedin_id: string
    linkedin_access_token: string
    api_key: string
    created_at: Generated<Date>
    updated_at: Generated<Date>
}

interface DB {
    users: UsersTable
}

export const db = new Kysely<DB>({ dialect })
