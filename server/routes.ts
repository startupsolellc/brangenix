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
const MAX_HISTORY_SIZE = 20;

function getCacheKey(keywords: string[], category: string, language: string): string {
  return `${keywords.sort().join(",")}|${category}|${language}`;
}

function cleanOldCache() {
  const now = Date.now();
  const entries = Array.from(nameGenerationCache.entries());
  entries.forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_DURATION) {
      nameGenerationCache.delete(key);
    }
  });
}

const getCategoryPrompt = (category: string, keywords: string[], language: string) => {
  const basePrompt = language === "en"
    ? `Generate 8 unique brand names based on these keywords: ${keywords.join(", ")}. Return response in this exact format: {"names": ["name1", "name2", "name3", "name4", "name5", "name6", "name7", "name8"]}`
    : `Bu anahtar kelimeleri kullanarak 8 benzersiz marka ismi üret: ${keywords.join(", ")}. Yanıtı tam olarak bu formatta döndür: {"names": ["isim1", "isim2", "isim3", "isim4", "isim5", "isim6", "isim7", "isim8"]}`;

  const categoryGuidelines: Record<string, string> = {
    "ecommerce": language === "en"
      ? "\nMake names suitable for digital presence. Avoid generic terms."
      : "\nİsimler dijital varlığa uygun olmalı. Genel terimlerden kaçının.",
    "finance": language === "en"
      ? "\nCreate names that convey trust and innovation."
      : "\nGüven ve yenilikçiliği yansıtan isimler oluşturun.",
    "gaming": language === "en"
      ? "\nGenerate dynamic, engaging names for gaming."
      : "\nOyun için dinamik ve ilgi çekici isimler oluşturun."
  };

  const categoryKey = category.toLowerCase().split(".")[0];
  const guideline = categoryGuidelines[categoryKey] || "";

  return `${basePrompt}${guideline}`;
};

export function registerRoutes(app: Express) {
  app.get("/api/brand-names", async (_req, res) => {
    try {
      const brandNames = await storage.getBrandNames(MAX_HISTORY_SIZE);
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

      const prompt = getCategoryPrompt(category, keywords, language);

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a brand name generator. Generate exactly 8 unique names and return them in JSON format with a 'names' array."
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.9,
        response_format: { type: "json_object" }, // Force JSON response
        max_tokens: 150,
        frequency_penalty: 0.8
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      console.log("OpenAI response:", content); // Debug log

      let result;
      try {
        result = JSON.parse(content);
      } catch (error) {
        console.error("Failed to parse OpenAI response:", content);
        throw new Error("Invalid JSON response from OpenAI");
      }

      // Handle both array and object formats
      const names = Array.isArray(result) ? result : result.names;
      if (!Array.isArray(names)) {
        console.error("Invalid response structure:", result);
        throw new Error("Invalid response format from OpenAI");
      }

      const responseData = { names };

      // Store in cache
      if (nameGenerationCache.size >= MAX_CACHE_SIZE) {
        const entries = Array.from(nameGenerationCache.entries());
        if (entries.length > 0) {
          const [oldestKey] = entries[0];
          nameGenerationCache.delete(oldestKey);
        }
      }

      nameGenerationCache.set(cacheKey, {
        names: responseData.names,
        timestamp: Date.now()
      });

      // Store in database
      await storage.createBrandName({
        keywords,
        category,
        generatedNames: responseData.names,
        language
      });

      res.json(responseData);
    } catch (error) {
      console.error("Error generating names:", error);
      res.status(500).json({ message: "Error generating names" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}