import {
  mysqlTable,
  char,
  varchar,
  timestamp,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

export const authSessions = mysqlTable(
  "auth_sessions",
  {
    id: char("id", { length: 36 }).primaryKey(),

    userId: char("user_id", { length: 36 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    role: varchar("role", { length: 20 }).notNull(),

    expiresAt: timestamp("expires_at").notNull(),

    isRevoked: boolean("is_revoked").default(false),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("auth_sessions_user_idx").on(t.userId),
    index("auth_sessions_expiry_idx").on(t.expiresAt),
  ],
);
