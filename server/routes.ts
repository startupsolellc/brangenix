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

export function registerRoutes(app: Express) {
  app.post("/api/generate-names", async (req, res) => {
    try {
      const { keywords, category, language } = generateNamesSchema.parse(req.body);

      const prompt = language === "en"
        ? `Generate 4 unique, brandable, and category-appropriate names for a ${category} company using keywords: ${keywords.join(", ")}. Names must be professional and catchy. Only respond with a JSON array containing exactly 4 names, like this: {"names": ["name1", "name2", "name3", "name4"]}`
        : `${category} sektöründe faaliyet gösterecek bir şirket için şu anahtar kelimeleri kullanarak 4 benzersiz ve akılda kalıcı marka ismi üret: ${keywords.join(", ")}. İsimler profesyonel ve etkileyici olmalı. Sadece 4 isim içeren bir JSON dizisi olarak yanıt ver, örneğin: {"names": ["isim1", "isim2", "isim3", "isim4"]}`;

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a professional brand name generator. Always respond with valid JSON." },
          { role: "user", content: prompt }
        ]
      });

      const result = JSON.parse(response.choices[0].message.content || "{}");

      if (!result.names || !Array.isArray(result.names) || result.names.length !== 4) {
        throw new Error("Invalid response format from OpenAI");
      }

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