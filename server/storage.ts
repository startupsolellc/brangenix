import { brandNames, type BrandName, type InsertBrandName } from "@shared/schema";
import { db } from "./db";
import { desc } from "drizzle-orm";

export interface IStorage {
  createBrandName(brandName: InsertBrandName): Promise<BrandName>;
  getBrandNames(limit?: number): Promise<BrandName[]>;
}

export class DatabaseStorage implements IStorage {
  async createBrandName(insertBrandName: InsertBrandName): Promise<BrandName> {
    const [brandName] = await db
      .insert(brandNames)
      .values(insertBrandName)
      .returning();
    return brandName;
  }

  async getBrandNames(limit?: number): Promise<BrandName[]> {
    const query = db.select()
      .from(brandNames)
      .orderBy(desc(brandNames.id));

    if (limit) {
      query.limit(limit);
    }

    return await query;
  }
}

export const storage = new DatabaseStorage();