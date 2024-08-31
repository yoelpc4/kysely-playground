import { Kysely, sql } from 'kysely'

export async function up(db: Kysely<any>): Promise<void> {
    await db
        .schema
        .createTable('users')
        .addColumn('id', 'serial', col => col.primaryKey())
        .addColumn('email', 'varchar', col => col.unique().notNull())
        .addColumn('name', 'varchar', col => col.notNull())
        .addColumn(
            'createdAt',
            'timestamp',
            col => col.notNull().defaultTo(sql`now()`)
        )
        .addColumn('updatedAt', 'timestamp')
        .execute()
}

export async function down(db: Kysely<any>): Promise<void> {
    await db.schema.dropTable('users').execute()
}
