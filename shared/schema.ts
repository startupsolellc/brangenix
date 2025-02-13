import { pgTable, text, serial, jsonb, timestamp, boolean, integer, foreignKey } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const brandNames = pgTable("brand_names", {
  id: serial("id").primaryKey(),
  keywords: text("keywords").array().notNull(),
  category: text("category").notNull(),
  generatedNames: jsonb("generated_names").$type<string[]>().notNull(),
  language: text("language").notNull(),
});

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: text("email").unique().notNull(),
  hashedPassword: text("hashed_password").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const nameGenerations = pgTable("name_generations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  count: integer("count").default(1).notNull(),
});

export const premiumSubscriptions = pgTable("premium_subscriptions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  expiresAt: timestamp("expires_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schemas for inserting data
export const insertBrandNameSchema = createInsertSchema(brandNames).pick({
  keywords: true,
  category: true,
  generatedNames: true,
  language: true,
});

export const insertUserSchema = createInsertSchema(users).pick({
  email: true,
  hashedPassword: true,
});

export const insertGenerationSchema = createInsertSchema(nameGenerations).pick({
  userId: true,
  count: true,
});

export const insertSubscriptionSchema = createInsertSchema(premiumSubscriptions).pick({
  userId: true,
  isActive: true,
  expiresAt: true,
});

// Types
export type InsertBrandName = z.infer<typeof insertBrandNameSchema>;
export type BrandName = typeof brandNames.$inferSelect;
export type User = typeof users.$inferSelect;
export type NameGeneration = typeof nameGenerations.$inferSelect;
export type PremiumSubscription = typeof premiumSubscriptions.$inferSelect;

export const generateNamesSchema = z.object({
  keywords: z.array(z.string()).min(3).max(5),
  category: z.string(),
  language: z.enum(["en", "tr"]),
});