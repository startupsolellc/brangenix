import { pgTable, text, serial, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const brandNames = pgTable("brand_names", {
  id: serial("id").primaryKey(),
  keywords: text("keywords").array().notNull(),
  category: text("category").notNull(),
  generatedNames: jsonb("generated_names").$type<string[]>().notNull(),
  language: text("language").notNull(),
});

export const insertBrandNameSchema = createInsertSchema(brandNames).pick({
  keywords: true,
  category: true,
  generatedNames: true,
  language: true,
});

export type InsertBrandName = z.infer<typeof insertBrandNameSchema>;
export type BrandName = typeof brandNames.$inferSelect;

export const generateNamesSchema = z.object({
  keywords: z.array(z.string()).min(3).max(5),
  category: z.string(),
  language: z.enum(["en", "tr"]),
});
