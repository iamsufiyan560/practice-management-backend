import {
  mysqlTable,
  char,
  varchar,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";

export const owners = mysqlTable(
  "owners",
  {
    id: char("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),

    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),

    createdBy: char("created_by", { length: 36 }),
    updatedBy: char("updated_by", { length: 36 }),

    isDeleted: boolean("is_deleted").default(false).notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (t) => [index("owners_active_created_idx").on(t.isDeleted, t.createdAt)],
);
