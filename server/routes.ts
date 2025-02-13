import type { Express } from "express";
import { createServer } from "http";
import { z } from "zod";
import OpenAI from "openai";
import { storage } from "./storage";
import { generateNamesSchema } from "@shared/schema";

if (!process.env.OPENAI_API_KEY) {
  throw new Error("OPENAI_API_KEY is required");
}

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 10000, // 10 second timeout
  maxRetries: 2
});

const getCategoryPrompt = (category: string, keywords: string[], language: string) => {
  const basePrompt = language === "en"
    ? `Generate 8 short and unique brand names using these keywords: ${keywords.join(", ")}. 
       Return only a JSON object with 'names' array.`
    : `Bu anahtar kelimeleri kullanarak 8 kısa ve benzersiz marka ismi üret: ${keywords.join(", ")}. 
       Sadece 'names' dizisi içeren bir JSON nesnesi döndür.`;

  return basePrompt;
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
      console.log("Starting name generation...");
      const { keywords, category, language } = generateNamesSchema.parse(req.body);
      console.log("Request params:", { keywords, category, language });

      const prompt = getCategoryPrompt(category, keywords, language);
      console.log("Generated prompt:", prompt);

      const response = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "You are a brand name generator. Return names in JSON format: {\"names\": [\"name1\", \"name2\", ...]}"
          },
          { role: "user", content: prompt }
        ],
        temperature: 0.9,
        max_tokens: 150
      });

      console.log("OpenAI API response received");
      const content = response.choices[0].message.content;
      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      console.log("OpenAI response content:", content);

      let result;
      try {
        result = JSON.parse(content);
        console.log("Parsed result:", result);
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
      console.log("Final response data:", responseData);

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