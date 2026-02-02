import {
  mysqlTable,
  char,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/mysql-core";

export const owners = mysqlTable("owners", {
  id: char("id", { length: 36 }).primaryKey(),

  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),

  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),

  createdBy: char("created_by", { length: 36 }), // ownerId (null for first root owner)
  updatedBy: char("updated_by", { length: 36 }),

  isDeleted: boolean("is_deleted").default(false),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
