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
        ? `Generate 4 unique, brandable, and category-appropriate names for a ${category} company using keywords: ${keywords.join(", ")}. Names must be professional and catchy. Respond with JSON in this format: { "names": string[] }`
        : `${category} sektöründe faaliyet gösterecek bir şirket için şu anahtar kelimeleri kullanarak 4 benzersiz ve akılda kalıcı marka ismi üret: ${keywords.join(", ")}. İsimler profesyonel ve etkileyici olmalı. JSON formatında yanıt ver: { "names": string[] }`;

      const response = await openai.chat.completions.create({
        model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { role: "system", content: "You are a professional brand name generator." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);

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
