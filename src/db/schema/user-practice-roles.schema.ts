import {
  mysqlTable,
  char,
  mysqlEnum,
  timestamp,
  uniqueIndex,
  index,
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

    status: mysqlEnum("status", ["ACTIVE", "INACTIVE"]).default("ACTIVE"),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    uniqueIndex("user_practice_unique").on(t.userId, t.practiceId),
    index("upr_user_idx").on(t.userId),
    index("upr_practice_idx").on(t.practiceId),
  ],
);
