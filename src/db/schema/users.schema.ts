import {
  mysqlTable,
  char,
  varchar,
  boolean,
  timestamp,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: char("id", { length: 36 }).primaryKey(),

  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: varchar("password_hash", { length: 255 }).notNull(),

  firstName: varchar("first_name", { length: 100 }),
  lastName: varchar("last_name", { length: 100 }),
  phone: varchar("phone", { length: 50 }),

  organizationId: char("organization_id", { length: 36 }).notNull(),

  role: mysqlEnum("role", ["ADMIN", "SUPERVISOR", "THERAPIST"]).notNull(),
  status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE"),

  isDeleted: boolean("is_deleted").default(false),
  createdBy: char("created_by", { length: 36 }),
  updatedBy: char("updated_by", { length: 36 }),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
