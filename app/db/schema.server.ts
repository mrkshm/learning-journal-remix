import { InferInsertModel, InferSelectModel } from "drizzle-orm";
import { text, sqliteTable, integer } from "drizzle-orm/sqlite-core";

export const entries = sqliteTable('entries', {
  id: integer('id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  category: text("category").default("work"),
  description: text("description").notNull(),
  date: text("date")
    .notNull()
    .default(`datetime("now")`),
});

export type Entry = InferSelectModel<typeof entries>;
export type InsertEntry = InferInsertModel<typeof entries>;
