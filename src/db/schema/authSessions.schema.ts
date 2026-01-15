import {
  mysqlTable,
  char,
  varchar,
  timestamp,
  boolean,
  index,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const authSessions = mysqlTable(
  "auth_sessions",
  {
    id: char("id", { length: 36 }).primaryKey(),

    userId: char("user_id", { length: 36 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),

    role: mysqlEnum("session_role", ["OWNER", "USER"]).notNull(),

    ipAddress: varchar("ip_address", { length: 100 }),
    userAgent: varchar("user_agent", { length: 500 }),
    device: varchar("device", { length: 255 }),

    expiresAt: timestamp("expires_at").notNull(),
    lastActivityAt: timestamp("last_activity_at"),

    isRevoked: boolean("is_revoked").default(false),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("auth_sessions_user_idx").on(t.userId),
    index("auth_sessions_expiry_idx").on(t.expiresAt),
  ],
);
