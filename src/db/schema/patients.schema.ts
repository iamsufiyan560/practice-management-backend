import {
  mysqlTable,
  char,
  varchar,
  boolean,
  timestamp,
  date,
  json,
  mysqlEnum,
  index,
} from "drizzle-orm/mysql-core";

export const patients = mysqlTable(
  "patients",
  {
    id: char("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    practiceId: char("practice_id", { length: 36 }).notNull(),
    therapistId: char("therapist_id", { length: 36 }),

    firstName: varchar("first_name", { length: 100 }),
    lastName: varchar("last_name", { length: 100 }),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),

    gender: varchar("gender", { length: 20 }),
    dob: date("dob"),

    address: json("address"),
    emergencyContact: json("emergency_contact"),

    isDeleted: boolean("is_deleted").default(false),
    createdBy: char("created_by", { length: 36 }),
    updatedBy: char("updated_by", { length: 36 }),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (t) => [
    index("patients_practice_idx").on(t.practiceId),
    index("patients_therapist_idx").on(t.therapistId),
    index("patients_email_idx").on(t.email),
  ],
);
