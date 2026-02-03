import {
  mysqlTable,
  char,
  varchar,
  timestamp,
  boolean,
  index,
  mysqlEnum,
} from "drizzle-orm/mysql-core";

export const passwordResets = mysqlTable(
  "password_resets",
  {
    id: char("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: char("user_id", { length: 36 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),

    otp: varchar("otp", { length: 10 }).notNull(),
    otpType: mysqlEnum("otp_type", [
      "FORGOT_PASSWORD",
      "CHANGE_PASSWORD",
    ]).notNull(),

    otpExpiry: timestamp("otp_expiry").notNull(),

    token: varchar("token", { length: 255 }).notNull(),
    tokenExpiry: timestamp("token_expiry").notNull(),

    isUsed: boolean("is_used").default(false),

    createdAt: timestamp("created_at").defaultNow(),
  },
  (t) => [
    index("reset_user_idx").on(t.userId),
    index("reset_email_idx").on(t.email),
    index("reset_token_idx").on(t.token),
  ],
);
