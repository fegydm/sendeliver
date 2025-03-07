// File: ./back/src/routes/ai.routes.ts
// Last change: Fixed TypeScript errors related to request body typing and response methods

import { Router } from "express";
import { AIService } from "../services/ai.services.js";
import { GeocodingService } from "../services/geocoding.services.js";
import { handleAIError } from "../utils/error-handler.js";

const router = Router();

const logRawData = (label: string, data: any) => {
  console.log(`[LOG][${label}] Raw Data:`, JSON.stringify(data, null, 2));
};

// Prompts for AI
const createPromptByType = {
  sender: (message: string) => `
    You are a JSON extraction API. Extract logistics details from: "${message}"
    Rulez:
    1. ONLY respond with JSON
    2. DO NOT add any other text
    3. DO NOT ask questions
    4. Extract ONLY mentioned information

    Return in this format (include only fields that were mentioned):
    {
      "pickupLocation": "City name if mentioned",
      "deliveryLocation": "City name if mentioned",
      "pickupTime": "YYYY-MM-DD if date mentioned",
      "deliveryTime": "YYYY-MM-DD if date mentioned",
      "weight": "value with kg if mentioned",
      "palletCount": number if mentioned
    }
  `,
  hauler: (message: string) => `
    You are a JSON extraction API. Extract vehicle details from: "${message}"
    Rules:
    1. ONLY respond with JSON
    2. DO NOT add any other text
    3. DO NOT ask questions
    4. Extract ONLY mentioned information

    Return in this format (include only fields that were mentioned):
    {
      "pickupLocation": "Starting city if mentioned",
      "deliveryLocation": "Destination city if mentioned",
      "pickupTime": "YYYY-MM-DD if date mentioned",
      "deliveryTime": "YYYY-MM-DD if date mentioned"
    }
  `,
  chat: (message: string) => `
    You are a conversational assistant. Respond informatively to: "${message}"
    Rules:
    1. Respond in natural language
    2. Provide helpful and concise answers
    3. Do not include JSON unless explicitly requested
  `,
};

// AI Extraction Endpoint
router.post("/extract", async (req: any, res: any): Promise<void> => {
  const { message } = req.body as { message: string };

  logRawData("Extract Request", req.body);

  try {
    const prompt = createPromptByType.sender(message);

    const aiResponse = await AIService.getInstance().sendMessage({
      message: prompt,
      type: "sender",
      lang1: "sk",
      temperature: 0,
    });

    logRawData("AI Extract Response", aiResponse.content);

    const extractedData = JSON.parse(aiResponse.content);
    res.json(extractedData);
  } catch (error) {
    const { status, body } = handleAIError(error);
    logRawData("Extract Error", error);
    res.status(status).json(body);
  }
});

// AI Chat Endpoint
router.post("/chat", async (req: any, res: any): Promise<void> => {
  const { message } = req.body as { message: string };

  logRawData("Chat Request", req.body);

  try {
    const prompt = createPromptByType.chat(message);

    const aiResponse = await AIService.getInstance().sendMessage({
      message: prompt,
      type: "chat",
      lang1: "sk",
      temperature: 0.7,
    });

    logRawData("AI Chat Response", aiResponse.content);

    res.json({ reply: aiResponse.content });
  } catch (error) {
    const { status, body } = handleAIError(error);
    logRawData("Chat Error", error);
    res.status(status).json(body);
  }
});

// Geocoding Endpoint
router.post("/geo", async (req: any, res: any): Promise<void> => {
  const { pickup, delivery } = req.body as { pickup?: string; delivery?: string };

  logRawData("Geo Request", req.body);

  try {
    const results = await Promise.all([
      pickup ? GeocodingService.getInstance().getCoordinates(pickup) : null,
      delivery ? GeocodingService.getInstance().getCoordinates(delivery) : null,
    ]);

    logRawData("Geo Results", results);

    res.json({
      pickup: results[0],
      delivery: results[1],
    });
  } catch (error) {
    logRawData("Geo Error", error);
    res.status(500).json({ error: "Failed to fetch coordinates", details: error });
  }
});

export default router;