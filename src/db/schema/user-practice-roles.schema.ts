import {
  mysqlTable,
  char,
  mysqlEnum,
  timestamp,
  uniqueIndex,
  index,
  varchar,
  boolean,
} from "drizzle-orm/mysql-core";

export const userPracticeRoles = mysqlTable(
  "user_practice_roles",
  {
    id: char("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: char("user_id", { length: 36 }).notNull(),
    practiceId: char("practice_id", { length: 36 }).notNull(),

    role: mysqlEnum("role", ["ADMIN", "SUPERVISOR", "THERAPIST"]).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),
    createdBy: char("created_by", { length: 36 }),
    updatedBy: char("updated_by", { length: 36 }),

    isDeleted: boolean("is_deleted").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (t) => [
    uniqueIndex("user_practice_unique").on(t.userId, t.practiceId),
    index("upr_user_idx").on(t.userId),
    index("upr_practice_idx").on(t.practiceId),
  ],
);
