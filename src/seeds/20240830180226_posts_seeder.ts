import { Kysely, sql } from 'kysely'
import { InsertablePost, InsertablePostTag } from '@/types/models';

export async function seed(db: Kysely<any>): Promise<void> {
    const user = await db.selectFrom('users').select(['id']).executeTakeFirstOrThrow()

    const tags = await db.selectFrom('tags').select(['id']).execute()

    const tagIds = tags.map(tag => tag.id)

    await db.transaction().execute(async trx => {
        await sql`TRUNCATE TABLE ${sql.table('postTags')}, ${sql.table('posts')} RESTART IDENTITY CASCADE`.execute(trx)

        const posts = await trx
            .insertInto('posts')
            .values([
                {
                    authorId: user.id,
                    title: 'Foo',
                    body: 'Lorem ipsum dolor sit amet',
                },
                {
                    authorId: user.id,
                    title: 'Bar',
                    body: 'Lorem ipsum dolor sit amet',
                },
                {
                    authorId: user.id,
                    title: 'Baz',
                    body: 'Lorem ipsum dolor sit amet',
                },
            ] as InsertablePost[])
            .returningAll()
            .execute()

        await trx
            .insertInto('postTags')
            .values(posts.reduce<InsertablePostTag[]>((values, post) => values.concat(tagIds.map(tagId => ({
                postId: post.id,
                tagId,
            }))), []))
            .execute()
    })
}
