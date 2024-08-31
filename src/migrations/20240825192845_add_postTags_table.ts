import { Kysely } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db
        .schema
        .createTable('postTags')
        .addColumn('postId', 'integer', col => col.references('posts.id').notNull())
        .addColumn('tagId', 'integer', col => col.references('tags.id').notNull())
        .addUniqueConstraint('postTags_postId_tagId_unique', ['postId', 'tagId'])
        .execute()

    await db
        .schema
        .createIndex('postTags_postId_index')
        .on('postTags')
        .column('postId')
        .execute()

    await db
        .schema
        .createIndex('postTags_tagId_index')
        .on('postTags')
        .column('tagId')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('postTags').execute()
}
