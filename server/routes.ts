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

const getCategoryPrompt = (category: string, keywords: string[], language: string) => {
  const basePrompt = language === "en"
    ? `Generate 8 unique and creative brand names based on these keywords: ${keywords.join(", ")}. 
       The names should be completely different from each other and memorable.
       Return your response in this exact JSON format: {"names": ["name1", "name2", "name3", "name4", "name5", "name6", "name7", "name8"]}`
    : `Bu anahtar kelimeleri kullanarak 8 benzersiz ve yaratıcı marka ismi üret: ${keywords.join(", ")}. 
       İsimler birbirinden tamamen farklı ve akılda kalıcı olmalı.
       Yanıtını tam olarak bu JSON formatında döndür: {"names": ["isim1", "isim2", "isim3", "isim4", "isim5", "isim6", "isim7", "isim8"]}`;

  const categoryGuidelines: Record<string, string> = {
    "ecommerce": language === "en"
      ? "\nMake names suitable for digital presence. Each name should be unique in the e-commerce space."
      : "\nİsimler dijital varlığa uygun olmalı. Her isim e-ticaret alanında benzersiz olmalı.",
    "finance": language === "en"
      ? "\nCreate names that convey trust and innovation. Each name should be distinctive in the financial sector."
      : "\nGüven ve yenilikçiliği yansıtan isimler oluşturun. Her isim finans sektöründe ayırt edici olmalı.",
    "gaming": language === "en"
      ? "\nGenerate dynamic, engaging names for gaming. Each name should stand out in the gaming industry."
      : "\nOyun için dinamik ve ilgi çekici isimler oluşturun. Her isim oyun sektöründe öne çıkmalı."
  };

  const categoryKey = category.toLowerCase().split(".")[0];
  const guideline = categoryGuidelines[categoryKey] || "";

  return `${basePrompt}${guideline}`;
};

export function registerRoutes(app: Express) {
  app.get("/api/brand-names", async (_req, res) => {
    try {
      const brandNames = await storage.getBrandNames(20);
      res.json(brandNames);
    } catch (error) {
      console.error("Error fetching brand names:", error);
      res.status(500).json({ message: "Error fetching brand names" });
    }
  });

  app.post("/api/generate-names", async (req, res) => {
    try {
      const { keywords, category, language } = generateNamesSchema.parse(req.body);
      const prompt = getCategoryPrompt(category, keywords, language);

      const response = await openai.chat.completions.create({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content: "You are a creative brand name generator. Generate exactly 8 unique and memorable names. Each name must be completely different from others in style and structure. Never repeat patterns or word combinations."
          },
          { role: "user", content: prompt }
        ],
        temperature: 1.0, 
        top_p: 1.0, 
        max_tokens: 200,
        frequency_penalty: 2.0, 
        presence_penalty: 2.0 
      });

      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      console.log("OpenAI response:", content); 

      let result;
      try {
        result = JSON.parse(content);
      } catch (error) {
        console.error("Failed to parse OpenAI response:", content);
        throw new Error("Invalid JSON response from OpenAI");
      }

      const names = Array.isArray(result) ? result : result.names;
      if (!Array.isArray(names)) {
        console.error("Invalid response structure:", result);
        throw new Error("Invalid response format from OpenAI");
      }

      const responseData = { names };

      
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