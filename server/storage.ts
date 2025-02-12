import { brandNames, type BrandName, type InsertBrandName } from "@shared/schema";
import { db } from "./db";

export interface IStorage {
  createBrandName(brandName: InsertBrandName): Promise<BrandName>;
  getBrandNames(): Promise<BrandName[]>;
}

export class DatabaseStorage implements IStorage {
  async createBrandName(insertBrandName: InsertBrandName): Promise<BrandName> {
    const [brandName] = await db
      .insert(brandNames)
      .values(insertBrandName)
      .returning();
    return brandName;
  }

  async getBrandNames(): Promise<BrandName[]> {
    return await db.select().from(brandNames);
  }
}

export const storage = new DatabaseStorage();