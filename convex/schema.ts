import { defineSchema } from "convex/server";

import usersTables from "./_core/schema/users";
import authTables from "./_core/schema/auth";
import agenciesTables from "./_core/schema/agencies";
import propertiesTables from "./_core/schema/properties";
import searchTables from "./_core/schema/search";
import knowledgeTables from "./_core/schema/knowledge";
import salesTables from "./_core/schema/sales";
import crmTables from "./_core/schema/crm";
import offersTables from "./_core/schema/offers";
import aiTables from "./_core/schema/ai";
import workspaceTables from "./_core/schema/workspace";
import adminTables from "./_core/schema/admin";
import contactTables from "./_core/schema/contact";

/**
 * anan-lit schema
 *
 * This file constructs the final schema passed to Convex by importing sub-schemas
 * from the `./schema/` directory to maintain logical separation of domains.
 *
 * For AI Assistants: See CONVEX_RULES.md for rules about writing queries and mutations.
 */
export default defineSchema({
  ...usersTables,
  ...authTables,
  ...agenciesTables,
  ...propertiesTables,
  ...searchTables,
  ...knowledgeTables,
  ...salesTables,
  ...crmTables,
  ...offersTables,
  ...aiTables,
  ...workspaceTables,
  ...adminTables,
  ...contactTables,
});
