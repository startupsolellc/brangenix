import { pgTable, text, serial, jsonb, timestamp, boolean, integer, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  hashedPassword: text("hashed_password").notNull(),
  isAdmin: boolean("is_admin").default(false).notNull(),
  generationCredits: integer("generation_credits").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const brandNames = pgTable("brand_names", {
  id: serial("id").primaryKey(),
  keywords: text("keywords").array().notNull(),
  category: text("category").notNull(),
  generatedNames: jsonb("generated_names").$type<string[]>().notNull(),
  language: text("language").notNull(),
});

export const nameGenerations = pgTable("name_generations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  category: text("category"), // Made nullable initially
  keywords: text("keywords").array(), // Made nullable initially
  createdAt: timestamp("created_at").defaultNow().notNull(),
  count: integer("count").default(1).notNull(),
  language: text("language"), // Made nullable initially
});

export const userActivity = pgTable("user_activity", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  action: text("action").notNull(), // e.g., 'generate_names', 'login', etc.
  metadata: jsonb("metadata").$type<Record<string, any>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const emailConfig = pgTable("email_config", {
  id: serial("id").primaryKey(),
  host: text("host").notNull(),
  port: integer("port").notNull(),
  username: text("username").notNull(),
  password: text("password").notNull(),
  fromEmail: text("from_email").notNull(),
  fromName: text("from_name").notNull(),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const premiumSubscriptions = pgTable("premium_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas for inserting data
export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  hashedPassword: true,
  isAdmin: true,
  generationCredits: true,
});

export const insertBrandNameSchema = createInsertSchema(brandNames).pick({
  keywords: true,
  category: true,
  generatedNames: true,
  language: true,
});

export const insertGenerationSchema = createInsertSchema(nameGenerations).pick({
  userId: true,
  category: true,
  keywords: true,
  count: true,
  language: true,
});

export const insertUserActivitySchema = createInsertSchema(userActivity).pick({
  userId: true,
  action: true,
  metadata: true,
});

export const insertEmailConfigSchema = createInsertSchema(emailConfig).pick({
  host: true,
  port: true,
  username: true,
  password: true,
  fromEmail: true,
  fromName: true,
  isEnabled: true,
});

export const insertSubscriptionSchema = createInsertSchema(premiumSubscriptions).pick({
  userId: true,
  isActive: true,
  expiresAt: true,
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type BrandName = typeof brandNames.$inferSelect;
export type NameGeneration = typeof nameGenerations.$inferSelect;
export type UserActivity = typeof userActivity.$inferSelect;
export type EmailConfig = typeof emailConfig.$inferSelect;
export type PremiumSubscription = typeof premiumSubscriptions.$inferSelect;

export const generateNamesSchema = z.object({
  keywords: z.array(z.string()).min(3).max(5),
  category: z.string(),
  language: z.enum(["en", "tr"]),
});