import 'dotenv/config'
import { Pool } from 'pg';
import { PostgresDialect } from 'kysely';
import { defineConfig } from "kysely-ctl";

const getPrefix = () => {
    const now = new Date()
    const year = now.getFullYear()
    const month = (now.getMonth() + 1).toString().padStart(2, '0')
    const date = now.getDate().toString().padStart(2, '0')
    const hours = now.getHours().toString().padStart(2, '0')
    const minutes = now.getMinutes().toString().padStart(2, '0')
    const seconds = now.getSeconds().toString().padStart(2, '0')
    return `${year}${month}${date}${hours}${minutes}${seconds}_`
}

export default defineConfig({
    dialect: new PostgresDialect({
        pool: new Pool({
            connectionString: process.env.DATABASE_URL,
            max: 10,
        })
    }),
    migrations: {
        allowJS: false, // optional. controls whether `.js`, `.cjs` or `.mjs` migrations are allowed. default is `false`.
        getMigrationPrefix: getPrefix, // optional. a function that returns a migration prefix. affects `migrate make` command. default is `() => ${Date.now()}_`.
        migrationFolder: 'src/migrations', // optional. name of migrations folder. default is `'migrations'`.
    },
    seeds: {
        allowJS: false, // optional. controls whether `.js`, `.cjs` or `.mjs` seeds are allowed. default is `false`.
        getSeedPrefix: getPrefix, // optional. a function that returns a seed prefix. affects `seed make` command. default is `() => ${Date.now()}_`.
        seedFolder: 'src/seeds', // optional. name of seeds folder. default is `'seeds'`.
    }
});
