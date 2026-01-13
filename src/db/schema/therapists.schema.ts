import {
  mysqlTable,
  char,
  varchar,
  boolean,
  timestamp,
  date,
  json,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";

export const therapists = mysqlTable(
  "therapists",
  {
    id: char("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    userId: char("user_id", { length: 36 }).notNull(),
    practiceId: char("practice_id", { length: 36 }).notNull(),

    supervisorId: char("supervisor_id", { length: 36 }),

    email: varchar("email", { length: 255 }).notNull(),
    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    phone: varchar("phone", { length: 50 }),

    licenseNumber: varchar("license_number", { length: 100 }),
    licenseState: varchar("license_state", { length: 50 }),
    licenseExpiry: date("license_expiry"),

    specialty: json("specialty").$type<string[]>(),

    isDeleted: boolean("is_deleted").default(false),
    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (t) => [
    index("therapists_practice_idx").on(t.practiceId),
    index("therapists_supervisor_idx").on(t.supervisorId),
    index("therapists_email_idx").on(t.email),
    uniqueIndex("therapist_user_practice_unique").on(t.userId, t.practiceId),
  ],
);
