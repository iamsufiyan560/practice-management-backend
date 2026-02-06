import {
  mysqlTable,
  char,
  varchar,
  boolean,
  timestamp,
  index,
} from "drizzle-orm/mysql-core";

export const practices = mysqlTable(
  "practices",
  {
    id: char("id", { length: 36 })
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),

    name: varchar("name", { length: 255 }).notNull(),
    legalName: varchar("legal_name", { length: 255 }),

    taxId: varchar("tax_id", { length: 50 }),
    npiNumber: varchar("npi_number", { length: 50 }),

    phone: varchar("phone", { length: 50 }),
    email: varchar("email", { length: 255 }),
    website: varchar("website", { length: 255 }),

    addressLine1: varchar("address_line1", { length: 255 }),
    addressLine2: varchar("address_line2", { length: 255 }),
    city: varchar("city", { length: 100 }),
    state: varchar("state", { length: 100 }),
    postalCode: varchar("postal_code", { length: 20 }),
    country: varchar("country", { length: 100 }),

    createdBy: char("created_by", { length: 36 }),
    updatedBy: char("updated_by", { length: 36 }),

    isDeleted: boolean("is_deleted").default(false),

    createdAt: timestamp("created_at").defaultNow(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
  },
  (t) => [
    index("practice_name_idx").on(t.name),
    index("practice_email_idx").on(t.email),
  ],
);
