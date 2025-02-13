import type { Express } from "express";
import { createServer } from "http";
import { z } from "zod";
import OpenAI from "openai";
import { storage } from "./storage";
import { generateNamesSchema } from "@shared/schema";
import { setupAuth } from "./auth";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 30000,
  maxRetries: 3
});

// Middleware to check if user is admin
const isAdmin = async (req: any, res: any, next: any) => {
  if (!req.user?.isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

const getCategoryPrompt = (category: string, keywords: string[], language: string) => {
  const basePrompt = language === "en"
    ? `Generate 8 unique and diverse brand names using these keywords: ${keywords.join(", ")}.
       Each name must be completely different from others.
       Never use the same prefix or suffix between names.
       Generate response in valid JSON format with this exact structure: {"names": ["name1", "name2", "name3", "name4", "name5", "name6", "name7", "name8"]}`
    : `Bu anahtar kelimeleri kullanarak 8 tamamen farklı marka ismi üret: ${keywords.join(", ")}.
       Her isim diğerlerinden tamamen farklı olmalı.
       İsimler arasında aynı ön ek veya son ek kullanma.
       Yanıtı bu tam JSON formatında ver: {"names": ["isim1", "isim2", "isim3", "isim4", "isim5", "isim6", "isim7", "isim8"]}`;

  return basePrompt;
};

export async function registerRoutes(app: Express) {
  // Set up authentication routes
  setupAuth(app);

  // Add admin routes
  app.get("/api/admin/statistics", isAdmin, async (_req, res) => {
    try {
      const stats = await storage.getUserStatistics();
      res.json(stats);
    } catch (error) {
      console.error("Error fetching admin statistics:", error);
      res.status(500).json({ message: "Error fetching statistics" });
    }
  });

  app.get("/api/admin/users", isAdmin, async (req, res) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;
      const users = await storage.getAllUsers(page, limit);
      res.json(users);
    } catch (error) {
      console.error("Error fetching users:", error);
      res.status(500).json({ message: "Error fetching users" });
    }
  });

  app.post("/api/admin/users/:id", isAdmin, async (req, res) => {
    try {
      const userId = Number(req.params.id);
      const updates = req.body;
      const user = await storage.updateUserStatus(userId, updates);
      res.json(user);
    } catch (error) {
      console.error("Error updating user:", error);
      res.status(500).json({ message: "Error updating user" });
    }
  });

  app.get("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const settings = await Promise.all([
        storage.getSystemSetting("guest_limit"),
        storage.getSystemSetting("free_user_limit"),
        storage.getSystemSetting("generation_cooldown")
      ]);
      res.json(settings.filter(Boolean));
    } catch (error) {
      console.error("Error fetching settings:", error);
      res.status(500).json({ message: "Error fetching settings" });
    }
  });

  app.post("/api/admin/settings", isAdmin, async (req, res) => {
    try {
      const { key, value } = req.body;
      const setting = await storage.updateSystemSetting(key, value, req.user!.id);
      res.json(setting);
    } catch (error) {
      console.error("Error updating setting:", error);
      res.status(500).json({ message: "Error updating setting" });
    }
  });

  app.get("/api/admin/activity", isAdmin, async (req, res) => {
    try {
      const activities = await storage.getRecentActivity();
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activity:", error);
      res.status(500).json({ message: "Error fetching activity" });
    }
  });

  // Name generation endpoint
  app.post("/api/generate-names", async (req, res) => {
    try {
      const { keywords, category, language } = generateNamesSchema.parse(req.body);

      // Handle guest users
      if (!req.user) {
        const guestToken = req.headers['x-guest-token'];
        if (!guestToken) {
          return res.status(401).json({ 
            message: "Sign in for more features",
            code: "GUEST_TOKEN_MISSING"
          });
        }

        // Get guest limit from system settings
        const guestLimitSetting = await storage.getSystemSetting("guest_limit");
        const GUEST_LIMIT = guestLimitSetting ? Number(guestLimitSetting.value) : 5;

        // Get current guest generations from header
        const guestGenerations = parseInt(req.headers['x-guest-generations'] as string) || 0;

        if (guestGenerations >= GUEST_LIMIT) {
          return res.status(403).json({
            message: "Guest generation limit reached",
            code: "GUEST_LIMIT_REACHED"
          });
        }

        // Increment guest generations in response header
        res.setHeader('x-guest-generations', (guestGenerations + 1).toString());
      } else {
        // For logged-in users, check premium status and credits availability
        const [user, isPremium] = await Promise.all([
          storage.getUserById(req.user.id),
          storage.isPremiumUser(req.user.id)
        ]);

        if (!isPremium && (!user?.generationCredits || user.generationCredits <= 0)) {
          return res.status(403).json({
            message: "No generation credits remaining. Upgrade to premium for unlimited generations.",
            code: "UPGRADE_REQUIRED"
          });
        }
      }

      const prompt = getCategoryPrompt(category, keywords, language);
      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a brand name generator. Generate unique names and return them in JSON format. Always include the word 'json' in your responses."
          },
          { role: "user", content: prompt }
        ],
        temperature: 1.0,
        max_tokens: 150,
        presence_penalty: 1.5,
        frequency_penalty: 1.5,
        response_format: { type: "json_object" }
      });

      const content = response.choices[0].message.content;

      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(content.trim());
      } catch (error) {
        console.error("Failed to parse OpenAI response:", content);
        throw new Error("Invalid JSON response from OpenAI");
      }

      if (!parsedContent.names || !Array.isArray(parsedContent.names)) {
        console.error("Invalid response structure:", parsedContent);
        throw new Error("Invalid response format from OpenAI");
      }

      const names = parsedContent.names.slice(0, 8);
      while (names.length < 8) {
        names.push(`Brand${names.length + 1}`);
      }

      // Track the generation
      if (req.user) {
        const isPremium = await storage.isPremiumUser(req.user.id);
        if (!isPremium) {
          await storage.decrementGenerationCredits(req.user.id);
        }
        await storage.trackGeneration(req.user.id);
      }

      // Save the generated names
      await storage.createBrandName({
        keywords,
        category,
        generatedNames: names,
        language
      });

      res.json({ names });

    } catch (error) {
      console.error("Error generating names:", error);
      res.status(500).json({
        message: "Error generating names",
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  app.get("/api/brand-names", async (_req, res) => {
    try {
      const brandNames = await storage.getBrandNames(20);
      res.json(brandNames);
    } catch (error) {
      console.error("Error fetching brand names:", error);
      res.status(500).json({ message: "Error fetching brand names" });
    }
  });


  return createServer(app);
}