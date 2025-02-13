import { brandNames, type BrandName, type InsertBrandName } from "@shared/schema";
import { db } from "./db";
import { desc } from "drizzle-orm";

export interface IStorage {
  createBrandName(brandName: InsertBrandName): Promise<BrandName>;
  getBrandNames(limit?: number): Promise<BrandName[]>;
}

export class DatabaseStorage implements IStorage {
  async createBrandName(insertBrandName: InsertBrandName): Promise<BrandName> {
    try {
      const [brandName] = await db
        .insert(brandNames)
        .values({
          keywords: insertBrandName.keywords,
          category: insertBrandName.category,
          generatedNames: insertBrandName.generatedNames,
          language: insertBrandName.language
        })
        .returning();
      return brandName;
    } catch (error) {
      console.error("Error creating brand name:", error);
      throw new Error("Failed to create brand name in database");
    }
  }

  async getBrandNames(limit?: number): Promise<BrandName[]> {
    try {
      const query = db.select()
        .from(brandNames)
        .orderBy(desc(brandNames.id));

      if (limit) {
        query.limit(limit);
      }

      return await query;
    } catch (error) {
      console.error("Error getting brand names:", error);
      throw new Error("Failed to get brand names from database");
    }
  }
}

export const storage = new DatabaseStorage();