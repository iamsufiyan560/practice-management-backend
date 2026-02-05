import {
  mysqlTable,
  char,
  varchar,
  boolean,
  timestamp,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable(
  "users",
  {
    id: char("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    email: varchar("email", { length: 255 }).notNull().unique(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),

    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    phone: varchar("phone", { length: 50 }),

    practiceId: char("practice_id", { length: 36 }).notNull(),

    role: mysqlEnum("role", ["ADMIN", "SUPERVISOR", "THERAPIST"]).notNull(),
    status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE"),

    isDeleted: boolean("is_deleted").default(false),
    createdBy: char("created_by", { length: 36 }),
    updatedBy: char("updated_by", { length: 36 }),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (t) => [
    index("users_email_idx").on(t.email),
    index("users_practice_idx").on(t.practiceId),
    index("users_role_idx").on(t.role),
  ],
);
