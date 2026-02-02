import {
  mysqlTable,
  char,
  varchar,
  boolean,
  timestamp,
} from "drizzle-orm/mysql-core";

export const organizations = mysqlTable("organizations", {
  id: char("id", { length: 36 }).primaryKey(),

  // basic info
  name: varchar("name", { length: 255 }).notNull(),
  legalName: varchar("legal_name", { length: 255 }),

  // healthcare identifiers
  taxId: varchar("tax_id", { length: 50 }),
  npiNumber: varchar("npi_number", { length: 50 }),

  // contact
  phone: varchar("phone", { length: 50 }),
  email: varchar("email", { length: 255 }),
  website: varchar("website", { length: 255 }),

  // address
  addressLine1: varchar("address_line1", { length: 255 }),
  addressLine2: varchar("address_line2", { length: 255 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 100 }),
  postalCode: varchar("postal_code", { length: 20 }),
  country: varchar("country", { length: 100 }),

  // audit
  createdBy: char("created_by", { length: 36 }), // ownerId
  updatedBy: char("updated_by", { length: 36 }),

  // soft delete
  isDeleted: boolean("is_deleted").default(false),

  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow().onUpdateNow(),
});
