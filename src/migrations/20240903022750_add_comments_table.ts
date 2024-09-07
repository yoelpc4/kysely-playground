import withTimestamp from "@/utils/helper";
import type { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // up migration code goes here...
  // note: up migrations are mandatory. you must implement this function.
  // For more info, see: https://kysely.dev/docs/migrations
  await db.schema
    .createTable("comments")
    .addColumn("id", "serial", (col) => col.primaryKey())
    .addColumn("postId", "integer", (col) =>
      col.references("posts.id").notNull()
    )
    .addColumn("userId", "integer", (col) =>
      col.references("users.id").notNull()
    )
    .addColumn("content", "text", (col) => col.notNull())
    .$call(withTimestamp)
    .execute();

  await db.schema
    .createIndex("comments_postId_index")
    .on("comments")
    .column("postId")
    .execute();

  await db.schema
    .createIndex("comments_userId_index")
    .on("comments")
    .column("userId")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // down migration code goes here...
  // note: down migrations are optional. you can safely delete this function.
  // For more info, see: https://kysely.dev/docs/migrations
  await db.schema.dropTable("comments").execute();
}
