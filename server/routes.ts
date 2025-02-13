import type { Express } from "express";
import { createServer } from "http";
import { z } from "zod";
import OpenAI from "openai";
import { storage } from "./storage";
import { generateNamesSchema } from "@shared/schema";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Simple in-memory cache for API responses
const nameGenerationCache = new Map<string, { names: string[], timestamp: number }>();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const MAX_CACHE_SIZE = 100;

function getCacheKey(keywords: string[], category: string, language: string): string {
  return `${keywords.sort().join(",")}|${category}|${language}`;
}

function cleanOldCache() {
  const now = Date.now();
  for (const [key, value] of nameGenerationCache.entries()) {
    if (now - value.timestamp > CACHE_DURATION) {
      nameGenerationCache.delete(key);
    }
  }
}

// Category-specific prompts
const getCategoryPrompt = (category: string, keywords: string[], language: string) => {
  const basePrompt = language === "en"
    ? `Generate 8 unique and brandable business names for a ${category} company using these keywords: ${keywords.join(", ")}. Names should be professional, catchy, and aligned with the industry.`
    : `${category} sektöründe faaliyet gösterecek bir şirket için şu anahtar kelimeleri kullanarak 8 benzersiz ve akılda kalıcı marka ismi üret: ${keywords.join(", ")}. İsimler profesyonel ve etkileyici olmalı.`;

  // Add category-specific guidelines
  const categoryGuidelines = {
    "finance": "Ensure names sound premium, reliable, and trustworthy.",
    "ecommerce": "Create modern, memorable names suitable for online presence.",
    "gaming": "Generate dynamic, engaging names appealing to a young audience.",
    // Add more categories as needed
  };

  const guideline = categoryGuidelines[category.toLowerCase().split(".")[0]] || "";
  return `${basePrompt} ${guideline} Only respond with a JSON array containing exactly 8 names, like this: {"names": ["name1", "name2", "name3", "name4", "name5", "name6", "name7", "name8"]}`;
};

export function registerRoutes(app: Express) {
  app.get("/api/brand-names", async (_req, res) => {
    try {
      const brandNames = await storage.getBrandNames();
      res.json(brandNames);
    } catch (error) {
      console.error("Error fetching brand names:", error);
      res.status(500).json({ message: "Error fetching brand names" });
    }
  });

  app.post("/api/generate-names", async (req, res) => {
    try {
      const { keywords, category, language } = generateNamesSchema.parse(req.body);

      // Check cache first
      const cacheKey = getCacheKey(keywords, category, language);
      const cachedResult = nameGenerationCache.get(cacheKey);

      if (cachedResult) {
        return res.json({ names: cachedResult.names });
      }

      // Clean old cache entries
      cleanOldCache();

      // Generate new names if not in cache
      const prompt = getCategoryPrompt(category, keywords, language);

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { 
            role: "system", 
            content: "You are a professional brand name generator. Always respond with valid JSON containing exactly 8 names." 
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.7,
        top_p: 0.8,
        max_tokens: 150,
        frequency_penalty: 0.5,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      if (!result.names || !Array.isArray(result.names) || result.names.length !== 8) {
        throw new Error("Invalid response format from OpenAI");
      }

      // Store in cache
      if (nameGenerationCache.size >= MAX_CACHE_SIZE) {
        // Remove oldest entry
        const oldestKey = nameGenerationCache.keys().next().value;
        nameGenerationCache.delete(oldestKey);
      }

      nameGenerationCache.set(cacheKey, {
        names: result.names,
        timestamp: Date.now()
      });

      await storage.createBrandName({
        keywords,
        category,
        generatedNames: result.names,
        language
      });

      res.json(result);
    } catch (error) {
      console.error("Error generating names:", error);
      res.status(500).json({ message: "Error generating names" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}