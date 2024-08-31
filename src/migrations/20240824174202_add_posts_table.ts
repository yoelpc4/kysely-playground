import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db
        .schema
        .createTable('posts')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('authorId', 'integer', col => col.references('users.id').notNull())
        .addColumn('title', 'varchar', col => col.notNull())
        .addColumn('body', 'text', col => col.notNull())
        .addColumn(
            'createdAt',
            'timestamp',
            col => col.notNull().defaultTo(sql`now()`)
        )
        .addColumn('updatedAt', 'timestamp')
        .execute()

    await db
        .schema
        .createIndex('posts_authorId_index')
        .on('posts')
        .column('authorId')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('posts').execute()
}
