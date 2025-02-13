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
  timeout: 30000, // 30 second timeout
  maxRetries: 3
});

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
            content: "You are a brand name generator. Generate unique names and return them in JSON format. Always include the word 'json' in your responses."
          },
          { role: "user", content: prompt }
        ],
        temperature: 1.0,          // High temperature for more randomness
        max_tokens: 150,
        presence_penalty: 1.5,     // High presence penalty to prevent repetition
        frequency_penalty: 1.5,    // High frequency penalty to prevent repetition
        response_format: { type: "json_object" }
      });

      console.log("OpenAI API response received");
      const content = response.choices[0].message.content;
      console.log("Raw API response:", content);

      if (!content) {
        throw new Error("Empty response from OpenAI");
      }

      let parsedContent;
      try {
        parsedContent = JSON.parse(content.trim());
        console.log("Parsed content:", parsedContent);
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

      const responseData = { names };
      console.log("Final response data:", responseData);

      await storage.createBrandName({
        keywords,
        category,
        generatedNames: names,
        language
      });

      res.json(responseData);
    } catch (error) {
      console.error("Error generating names:", error);
      res.status(500).json({
        message: "Error generating names",
        error: error instanceof Error ? error.message : "Unknown error occurred",
        details: error instanceof Error ? error.stack : undefined
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}