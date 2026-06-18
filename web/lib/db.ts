import { Kysely, PostgresDialect } from 'kysely'
import { Pool } from 'pg'
import { env } from './env'

const dialect = new PostgresDialect({
    pool: new Pool({ connectionString: env.DB_URL }),
})

interface DB {
}

export const db = new Kysely<DB>({ dialect })