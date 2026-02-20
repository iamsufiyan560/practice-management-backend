import {
  mysqlTable,
  char,
  varchar,
  boolean,
  timestamp,
  date,
  json,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";

export const supervisors = mysqlTable(
  "supervisors",
  {
    id: char("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: char("user_id", { length: 36 }).notNull(),
    practiceId: char("practice_id", { length: 36 }).notNull(),

    email: varchar("email", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    phone: varchar("phone", { length: 50 }).notNull(),

    licenseNumber: varchar("license_number", { length: 100 }),
    licenseState: varchar("license_state", { length: 50 }),
    licenseExpiry: date("license_expiry"),

    specialty: json("specialty").$type<string[]>(),

    isDeleted: boolean("is_deleted").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (t) => [
    index("supervisors_practice_idx").on(t.practiceId),
    index("supervisors_email_idx").on(t.email),
    uniqueIndex("supervisor_user_practice_unique").on(t.userId, t.practiceId),
  ],
);
