import { type InsertBrandName, type BrandName } from "@shared/schema";

export interface IStorage {
  createBrandName(brandName: InsertBrandName): Promise<BrandName>;
  getBrandNames(): Promise<BrandName[]>;
}

export class MemStorage implements IStorage {
  private brandNames: Map<number, BrandName>;
  private currentId: number;

  constructor() {
    this.brandNames = new Map();
    this.currentId = 1;
  }

  async createBrandName(insertBrandName: InsertBrandName): Promise<BrandName> {
    const id = this.currentId++;
    const brandName: BrandName = { id, ...insertBrandName };
    this.brandNames.set(id, brandName);
    return brandName;
  }

  async getBrandNames(): Promise<BrandName[]> {
    return Array.from(this.brandNames.values());
  }
}

export const storage = new MemStorage();
