import { Kysely, PostgresDialect } from 'kysely';
import { Pool } from 'pg'
import { DB } from '@/types/db'

export const db = new Kysely<DB>({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 10,
        })
    }),
    // uncomment line below to log query and error
    log: ['query', 'error'],
})
