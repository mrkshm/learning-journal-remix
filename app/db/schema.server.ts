import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";

export const entries = sqliteTable('entries', {
  id: integer('id', {mode: 'number'}).primaryKey({ autoIncrement: true }),
  category: text("category").default("work"),
  title: text("title").notNull(),
  description: text("description"),
  date: text("date")
    .notNull()
    .default(`datetime("now")`),
});