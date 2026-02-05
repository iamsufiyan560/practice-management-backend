import {
  mysqlTable,
  char,
  timestamp,
  text,
  mysqlEnum,
  boolean,
  index,
} from "drizzle-orm/mysql-core";

export const patientSessions = mysqlTable(
  "patient_sessions",
  {
    id: char("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    practiceId: char("practice_id", { length: 36 }).notNull(),
    patientId: char("patient_id", { length: 36 }).notNull(),
    therapistId: char("therapist_id", { length: 36 }).notNull(),

    scheduledStart: timestamp("scheduled_start").notNull(),
    scheduledEnd: timestamp("scheduled_end").notNull(),

    sessionType: mysqlEnum("session_type", [
      "INITIAL",
      "FOLLOW_UP",
      "CRISIS",
    ]).notNull(),

    subjective: text("subjective"),
    objective: text("objective"),
    assessment: text("assessment"),
    plan: text("plan"),
    additionalNotes: text("additional_notes"),
    aiSummary: text("ai_summary"),

    reviewStatus: mysqlEnum("review_status", [
      "DRAFT",
      "PENDING",
      "APPROVED",
      "REJECTED",
    ]).default("DRAFT"),

    reviewComment: text("review_comment"),

    isDeleted: boolean("is_deleted").default(false),

    createdBy: char("created_by", { length: 36 }),
    updatedBy: char("updated_by", { length: 36 }),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (t) => [
    index("sessions_practice_idx").on(t.practiceId),
    index("sessions_therapist_idx").on(t.therapistId),
    index("sessions_patient_idx").on(t.patientId),
    index("sessions_review_idx").on(t.reviewStatus),
  ],
);
