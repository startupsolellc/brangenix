import { brandNames, users, nameGenerations, premiumSubscriptions, systemSettings, userActivity, type BrandName, type InsertBrandName, type NameGeneration, type User, type PremiumSubscription, type SystemSetting, type InsertSystemSetting, type UserActivity } from "@shared/schema";
import { db } from "./db";
import { desc, eq, and, gt, sql, count } from "drizzle-orm";

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
  // Admin methods
  getAllUsers(page: number, limit: number): Promise<{ users: User[], total: number }>;
  updateUserStatus(userId: number, updates: Partial<User>): Promise<User>;
  getSystemSetting(key: string): Promise<SystemSetting | undefined>;
  updateSystemSetting(key: string, value: any, updatedBy: number): Promise<SystemSetting>;
  getUserStatistics(): Promise<{
    totalUsers: number;
    totalGenerations: number;
    activeUsers: number;
  }>;
  getRecentActivity(limit?: number): Promise<UserActivity[]>;
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
      // First get current credits
      const [currentUser] = await db
        .select({
          credits: users.generationCredits
        })
        .from(users)
        .where(eq(users.id, userId));


      if (!currentUser || currentUser.credits <= 0) {
        throw new Error("No credits available");
      }

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

      if (!result.length) {
        throw new Error("Failed to decrement credits");
      }
    } catch (error) {
      console.error("Error decrementing generation credits:", error);
      throw error instanceof Error ? error : new Error("Failed to decrement generation credits");
    }
  }

  // Admin methods implementation
  async getAllUsers(page: number = 1, limit: number = 10): Promise<{ users: User[], total: number }> {
    try {
      const offset = (page - 1) * limit;

      const [usersResult, countResult] = await Promise.all([
        db.select().from(users)
          .orderBy(desc(users.createdAt))
          .limit(limit)
          .offset(offset),
        db.select({ count: sql<number>`count(*)` }).from(users)
      ]);

      return {
        users: usersResult,
        total: countResult[0].count
      };
    } catch (error) {
      console.error("Error getting users:", error);
      throw new Error("Failed to get users from database");
    }
  }

  async updateUserStatus(userId: number, updates: Partial<User>): Promise<User> {
    try {
      const [updatedUser] = await db
        .update(users)
        .set(updates)
        .where(eq(users.id, userId))
        .returning();

      if (!updatedUser) {
        throw new Error("User not found");
      }

      return updatedUser;
    } catch (error) {
      console.error("Error updating user status:", error);
      throw new Error("Failed to update user status");
    }
  }

  async getSystemSetting(key: string): Promise<SystemSetting | undefined> {
    try {
      const [setting] = await db
        .select()
        .from(systemSettings)
        .where(eq(systemSettings.key, key));
      return setting;
    } catch (error) {
      console.error("Error getting system setting:", error);
      throw new Error("Failed to get system setting");
    }
  }

  async updateSystemSetting(
    key: string,
    value: any,
    updatedBy: number
  ): Promise<SystemSetting> {
    try {
      const [setting] = await db
        .insert(systemSettings)
        .values({ key, value, updatedBy })
        .onConflictDoUpdate({
          target: systemSettings.key,
          set: { value, updatedBy, updatedAt: new Date() }
        })
        .returning();

      if (!setting) {
        throw new Error("Failed to update system setting");
      }

      return setting;
    } catch (error) {
      console.error("Error updating system setting:", error);
      throw new Error("Failed to update system setting");
    }
  }

  async getUserStatistics(): Promise<{
    totalUsers: number;
    totalGenerations: number;
    activeUsers: number;
  }> {
    try {
      const [userCount, generationCount, activeUserCount] = await Promise.all([
        db.select({ count: sql<number>`count(*)` }).from(users),
        db.select({ count: sql<number>`sum(${nameGenerations.count})` }).from(nameGenerations),
        db.select({ count: sql<number>`count(distinct ${nameGenerations.userId})` })
          .from(nameGenerations)
          .where(
            gt(nameGenerations.createdAt, sql`NOW() - INTERVAL '30 days'`)
          )
      ]);

      return {
        totalUsers: userCount[0].count,
        totalGenerations: generationCount[0].count || 0,
        activeUsers: activeUserCount[0].count
      };
    } catch (error) {
      console.error("Error getting user statistics:", error);
      throw new Error("Failed to get user statistics");
    }
  }
  async getRecentActivity(limit: number = 50): Promise<UserActivity[]> {
    try {
      const activities = await db
        .select()
        .from(userActivity)
        .orderBy(desc(userActivity.createdAt))
        .limit(limit);

      return activities;
    } catch (error) {
      console.error("Error getting recent activity:", error);
      throw new Error("Failed to get recent activity");
    }
  }
}

export const storage = new DatabaseStorage();