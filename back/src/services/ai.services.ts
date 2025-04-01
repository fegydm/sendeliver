// File: src/services/ai.services.ts
// Last change: Added bounding box handling and dual-source geodata storage

import { OpenAI } from "openai";
import { AIRequest, AIResponse } from "../types/ai.types.js";
import { AI_CONFIG } from "../configs/openai.config.js";
import { GeocodingService } from "./geocoding.services.js";
import * as fs from "fs";

interface AIData {
  pickupLocation: string;
  pickupCoordinates?: { lat: number; lng: number; source: "AI" | "GEO" };
  deliveryLocation?: string;
  deliveryCoordinates?: { lat: number; lng: number; source: "AI" | "GEO" };
  pickupTime?: string;
  deliveryTime?: string;
  weight?: string;
  palletCount?: number;
  geoData?: {
    pickup?: Array<{
      lat: number;
      lng: number;
      source: "AI" | "GEO";
      boundingbox?: string[];
    }>;
    delivery?: Array<{
      lat: number;
      lng: number;
      source: "AI" | "GEO";
      boundingbox?: string[];
    }>;
  };
}

export class AIService {
  private static instance: AIService;
  private openai: OpenAI;

  private constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not set in environment variables");
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  public static getInstance(): AIService {
    if (!this.instance) {
      this.instance = new AIService();
    }
    return this.instance;
  }

  private logRawResponse(content: string): void {
    console.log("[AI] Raw response:", content);
    fs.appendFileSync(
      "ai_responses.log",
      `[${new Date().toISOString()}] ${content}\n`
    );
  }

  private extractJSON(content: string): Partial<AIData> | null {
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn("[AI] No JSON found in response. Raw content:", content);
        return null;
      }

      const parsedData = JSON.parse(jsonMatch[0]);
      console.log("[AI] Extracted JSON data:", parsedData);
      return parsedData;
    } catch (error) {
      console.error("[AI] Failed to parse JSON:", error);
      return null;
    }
  }

  private async fetchCoordinates(
    location: string,
    source: "AI" | "GEO"
  ): Promise<{ lat: number; lng: number; boundingbox?: string[]; source: "AI" | "GEO" } | null> {
    const geocodingService = GeocodingService.getInstance();

    if (source === "GEO") {
      try {
        const geoData = await geocodingService.getCoordinates(location);
        return { ...geoData, source: "GEO" };
      } catch (error) {
        console.error(`[GEO] Failed to fetch coordinates for "${location}"`, error);
        return null;
      }
    }

    return null;
  }

  public async sendMessage(request: AIRequest): Promise<AIResponse> {
    try {
      const language = request.lang1 || "en";

      const systemPromptText = `
      You are a logistics assistant. Based on the user's input, extract the following details:

      1. Pickup location (required)
      2. Delivery location (optional)
      3. Pickup time (optional)
      4. Delivery time (optional)
      5. Weight (optional)
      6. Pallet count (optional)

      For the pickup and delivery locations, always provide GPS coordinates (latitude and longitude) and bounding box (if possible).

      Respond in this format:
      {
        "pickupLocation": "<city>",
        "pickupCoordinates": { "lat": <latitude>, "lng": <longitude>, "boundingbox": [<south>, <north>, <west>, <east>] },
        "deliveryLocation": "<city>",
        "deliveryCoordinates": { "lat": <latitude>, "lng": <longitude>, "boundingbox": [<south>, <north>, <west>, <east>] },
        "pickupTime": "<YYYY-MM-DD>",
        "deliveryTime": "<YYYY-MM-DD>",
        "weight": "<number>kg",
        "palletCount": <number>
      }

      For missing optional details, include them as \`null\` or ask the user for clarification.
      `;

      console.log("[AI] Prompt sent to OpenAI:", systemPromptText);

      const completion = await this.openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          { role: "system", content: systemPromptText },
          { role: "user", content: request.message },
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: 1000,
      });

      const content = completion.choices[0]?.message?.content || "";

      this.logRawResponse(content);

      const extractedData = this.extractJSON(content);

      if (!extractedData || !extractedData.pickupLocation) {
        throw new Error("Failed to extract required data from AI response.");
      }

      const geoData: AIData["geoData"] = {};

      // Fetch AI and GEO coordinates for pickup
      if (extractedData.pickupCoordinates) {
        geoData.pickup = geoData.pickup || [];
        geoData.pickup.push({
          ...extractedData.pickupCoordinates,
          source: "AI",
        });
      }
      const geoPickup = await this.fetchCoordinates(
        extractedData.pickupLocation,
        "GEO"
      );
      if (geoPickup) {
        geoData.pickup = geoData.pickup || [];
        geoData.pickup.push(geoPickup);
      }

      // Fetch AI and GEO coordinates for delivery
      if (extractedData.deliveryCoordinates) {
        geoData.delivery = geoData.delivery || [];
        geoData.delivery.push({
          ...extractedData.deliveryCoordinates,
          source: "AI",
        });
      }
      if (extractedData.deliveryLocation) {
        const geoDelivery = await this.fetchCoordinates(
          extractedData.deliveryLocation,
          "GEO"
        );
        if (geoDelivery) {
          geoData.delivery = geoData.delivery || [];
          geoData.delivery.push(geoDelivery);
        }
      }

      extractedData.geoData = geoData;

      return {
        content,
        data: extractedData,
      };
    } catch (error) {
      console.error("[AI] OpenAI API Error:", error);
      throw error;
    }
  }
}
