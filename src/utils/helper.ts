import {
  ColumnDefinitionBuilder,
  CreateTableBuilder,
  sql,
} from "kysely";

export default function withTimestamp<
  TB extends string,
  c extends string = never
>(qb: CreateTableBuilder<TB, c>): CreateTableBuilder<TB, c> {
  return qb
    .addColumn("created_at", "timestamptz", (col: ColumnDefinitionBuilder) =>
      col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
    )
    .addColumn("updated_at", "timestamptz", (col: ColumnDefinitionBuilder) =>
      col.defaultTo(null)
    );
}
