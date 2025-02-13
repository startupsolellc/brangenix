import { brandNames, users, nameGenerations, premiumSubscriptions, type BrandName, type InsertBrandName, type NameGeneration, type User, type PremiumSubscription } from "@shared/schema";
import { db } from "./db";
import { desc, eq, and, gt, sql } from "drizzle-orm";

export interface IStorage {
  createBrandName(brandName: InsertBrandName): Promise<BrandName>;
  getBrandNames(limit?: number): Promise<BrandName[]>;
  getUserGenerations(userId: number): Promise<number>;
  trackGeneration(userId?: number): Promise<void>;
  getUserById(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(data: { email: string; hashedPassword: string }): Promise<User>;
  isPremiumUser(userId: number): Promise<boolean>;
  decrementGenerationCredits(userId: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async createBrandName(insertBrandName: InsertBrandName): Promise<BrandName> {
    try {
      const [brandName] = await db
        .insert(brandNames)
        .values([insertBrandName])
        .returning();

      if (!brandName) {
        throw new Error("Failed to create brand name - no record returned");
      }

      return brandName;
    } catch (error) {
      console.error("Error creating brand name:", error);
      throw new Error("Failed to create brand name in database");
    }
  }

  async getBrandNames(limit?: number): Promise<BrandName[]> {
    try {
      const query = db
        .select()
        .from(brandNames)
        .orderBy(desc(brandNames.id));

      if (limit) {
        return await query.limit(limit);
      }

      return await query;
    } catch (error) {
      console.error("Error getting brand names:", error);
      throw new Error("Failed to get brand names from database");
    }
  }

  async getUserGenerations(userId: number): Promise<number> {
    try {
      const result = await db
        .select({
          count: sql<number>`sum(${nameGenerations.count})`
        })
        .from(nameGenerations)
        .where(eq(nameGenerations.userId, userId));

      return result[0]?.count || 0;
    } catch (error) {
      console.error("Error getting user generations:", error);
      throw new Error("Failed to get user generations");
    }
  }

  async trackGeneration(userId?: number): Promise<void> {
    try {
      await db.insert(nameGenerations).values({
        userId: userId,
        count: 1,
      });
    } catch (error) {
      console.error("Error tracking generation:", error);
      throw new Error("Failed to track generation");
    }
  }

  async getUserById(id: number): Promise<User | undefined> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id));
      return user;
    } catch (error) {
      console.error("Error getting user:", error);
      throw new Error("Failed to get user");
    }
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.email, email));
      return user;
    } catch (error) {
      console.error("Error getting user by email:", error);
      throw new Error("Failed to get user by email");
    }
  }

  async createUser(data: { email: string; hashedPassword: string }): Promise<User> {
    try {
      const [user] = await db
        .insert(users)
        .values(data)
        .returning();

      if (!user) {
        throw new Error("Failed to create user - no record returned");
      }

      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Failed to create user in database");
    }
  }

  async isPremiumUser(userId: number): Promise<boolean> {
    try {
      const [subscription] = await db
        .select()
        .from(premiumSubscriptions)
        .where(
          and(
            eq(premiumSubscriptions.userId, userId),
            eq(premiumSubscriptions.isActive, true),
            gt(premiumSubscriptions.expiresAt, new Date())
          )
        );
      return !!subscription;
    } catch (error) {
      console.error("Error checking premium status:", error);
      throw new Error("Failed to check premium status");
    }
  }

  async decrementGenerationCredits(userId: number): Promise<void> {
    try {
      console.log(`Attempting to decrement credits for user ${userId}`);

      // First get current credits
      const [currentUser] = await db
        .select({
          credits: users.generationCredits
        })
        .from(users)
        .where(eq(users.id, userId));

      console.log(`Current credits for user ${userId}: ${currentUser?.credits}`);

      const result = await db
        .update(users)
        .set({
          generationCredits: sql`${users.generationCredits} - 1`
        })
        .where(
          and(
            eq(users.id, userId),
            sql`${users.generationCredits} > 0`
          )
        )
        .returning({ updatedCredits: users.generationCredits });

      console.log(`Update result for user ${userId}:`, result);

      if (!result.length) {
        console.log(`No credits were decremented for user ${userId} - possibly at 0`);
        throw new Error("No credits available");
      }

      console.log(`Successfully decremented credits for user ${userId}. New value: ${result[0].updatedCredits}`);
    } catch (error) {
      console.error("Error decrementing generation credits:", error);
      throw new Error("Failed to decrement generation credits");
    }
  }
}

export const storage = new DatabaseStorage();