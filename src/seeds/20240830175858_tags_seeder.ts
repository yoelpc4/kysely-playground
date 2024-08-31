import { Kysely, sql } from 'kysely'
import { InsertableTag } from '@/types/models';

export async function seed(db: Kysely<any>): Promise<void> {
    await db.transaction().execute(async trx => {
        await sql`TRUNCATE TABLE ${sql.table('tags')} RESTART IDENTITY CASCADE`.execute(trx)

        await trx
            .insertInto('tags')
            .values([
                {
                    name: 'Computer',
                },
                {
                    name: 'Music',
                },
                {
                    name: 'Finance',
                },
            ] as InsertableTag[])
            .execute()
    })
}
