import { Kysely, sql } from 'kysely'
import { InsertableUser } from '@/types/models';

export async function seed(db: Kysely<any>): Promise<void> {
    await db.transaction().execute(async trx => {
        await sql`TRUNCATE TABLE ${sql.table('users')} RESTART IDENTITY CASCADE`.execute(trx)

        await trx
            .insertInto('users')
            .values([
                {
                    email: 'johndoe@gmail.com',
                    name: 'John Doe',
                },
                {
                    email: 'janedoe@gmail.com',
                    name: 'Jane Doe',
                },
            ] as InsertableUser[])
            .execute()
    })
}
