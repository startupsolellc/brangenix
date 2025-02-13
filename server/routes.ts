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
const MAX_HISTORY_SIZE = 20; // Maximum number of history records to keep

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

// Category-specific prompts
const getCategoryPrompt = (category: string, keywords: string[], language: string) => {
  const basePrompt = language === "en"
    ? `Generate 8 completely unique and creative brand names based on these keywords: ${keywords.join(", ")}. The names should be:
       - Completely different from each other
       - Memorable and easy to pronounce
       - Relevant to ${category} industry
       - Avoid common naming patterns or overused suffixes
       - Each name should have a unique character/style
       Return exactly 8 names in a JSON array format.`
    : `Şu anahtar kelimeleri kullanarak 8 adet tamamen benzersiz ve yaratıcı marka ismi üret: ${keywords.join(", ")}. İsimler:
       - Birbirinden tamamen farklı olmalı
       - Akılda kalıcı ve telaffuzu kolay olmalı
       - ${category} sektörüne uygun olmalı
       - Sık kullanılan kalıplardan veya eklerden kaçınmalı
       - Her isim kendine özgü bir karakter/stile sahip olmalı
       JSON dizi formatında tam 8 isim döndür.`;

  // Kategori özel kuralları
  const categoryGuidelines: Record<string, string> = {
    "ecommerce": language === "en"
      ? "Make names suitable for digital presence and e-commerce platforms. Avoid generic terms like 'shop' or 'store'."
      : "İsimler dijital varlık ve e-ticaret platformlarına uygun olmalı. 'shop' veya 'store' gibi genel terimlerden kaçının.",
    "finance": language === "en"
      ? "Create names that convey trust, reliability, and innovation in financial services. Avoid common fintech naming patterns."
      : "Finansal hizmetlerde güven, güvenilirlik ve yenilikçiliği yansıtan isimler oluşturun. Yaygın fintech isimlendirme kalıplarından kaçının.",
    "gaming": language === "en"
      ? "Generate dynamic, engaging names suitable for gaming and entertainment. Each name should feel unique in the gaming space."
      : "Oyun ve eğlence için uygun, dinamik ve ilgi çekici isimler oluşturun. Her isim oyun alanında benzersiz olmalı."
  };

  const categoryKey = category.toLowerCase().split(".")[0];
  const guideline = categoryGuidelines[categoryKey] || "";

  return `${basePrompt}\n${guideline}`;
};

export function registerRoutes(app: Express) {
  app.get("/api/brand-names", async (_req, res) => {
    try {
      // Get only the last 20 brand names
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

      // Generate new names if not in cache
      const prompt = getCategoryPrompt(category, keywords, language);

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: `You are a creative brand name generator specialized in creating unique, memorable names.
                     Each name you generate must be completely different from others.
                     Never repeat patterns or similar word combinations.
                     Focus on creating distinctive and original names.`
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.95, // Daha yaratıcı sonuçlar için artırıldı
        top_p: 0.95, // Çeşitliliği artırmak için yükseltildi
        max_tokens: 150,
        frequency_penalty: 1.0, // Tekrarı önlemek için maksimum değer
        presence_penalty: 0.8 // Yeni kelime kullanımını teşvik etmek için yüksek değer
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      let result;
      try {
        result = JSON.parse(content);
      } catch (error) {
        console.error("Failed to parse OpenAI response:", content);
        throw new Error("Invalid JSON response from OpenAI");
      }

      if (!result.names || !Array.isArray(result.names) || result.names.length !== 8) {
        console.error("Invalid response structure:", result);
        throw new Error("Invalid response format from OpenAI");
      }

      // Store in cache
      if (nameGenerationCache.size >= MAX_CACHE_SIZE) {
        // Remove oldest entry if cache is full
        const entries = Array.from(nameGenerationCache.entries());
        if (entries.length > 0) {
          const [oldestKey] = entries[0];
          nameGenerationCache.delete(oldestKey);
        }
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