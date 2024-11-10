// ./back/services/ai.service.ts
import { env } from "../configs/index.mjs";
import OpenAI from "openai";
import * as redis from "../configs/redis.mjs";
// import { pool } from '../configs/database'; // TODO: pre budúce použitie

interface Location {
  city: string;
  zip?: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

interface ExtractedData {
  pickup?: Location;
  delivery?: Location;
  weight?: number;
  pallets?: number;
  pickupTime?: string;
  deliveryTime?: string;
}

class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: env.openai.API_KEY,
    });
  }

  // TODO: Implementovať keď budú dáta
  private async validateLocation(location: Location): Promise<Location> {
    /* 
    // Budúca implementácia
    const query = `
      SELECT l.city, l.zip_code, l.latitude, l.longitude
      FROM locations l
      WHERE LOWER(l.city) = LOWER($1)
      OR l.zip_code = $2
      LIMIT 1
    `;

    try {
      const result = await pool.query(query, [location.city, location.zip]);
      if (result.rows[0]) {
        return {
          city: result.rows[0].city,
          zip: result.rows[0].zip_code,
          coordinates: {
            lat: result.rows[0].latitude,
            lng: result.rows[0].longitude
          }
        };
      }
    } catch (error) {
      console.error('Error validating location:', error);
    }
    */

    // Zatiaľ vrátime originálne dáta
    return location;
  }

  private async getCachedResponse(prompt: string): Promise<string | null> {
    const cacheKey = `ai:transport:${Buffer.from(prompt).toString("base64")}`;
    return await redis.getCache(cacheKey);
  }

  private async setCachedResponse(
    prompt: string,
    response: string
  ): Promise<void> {
    const cacheKey = `ai:transport:${Buffer.from(prompt).toString("base64")}`;
    await redis.setCache(cacheKey, response, 3600);
  }

  private async extractDataFromText(text: string): Promise<ExtractedData> {
    try {
      const cachedResponse = await this.getCachedResponse(text);
      if (cachedResponse) {
        return JSON.parse(cachedResponse);
      }

      const response = await this.openai.chat.completions.create({
        model: env.openai.MODEL,
        messages: [
          {
            role: "system",
            content: `
              You are a logistics assistant specialized in European transport.
              Extract shipping details and return them in JSON format.
              For locations, always try to identify city and postal code if mentioned.
              If postal code is not mentioned, return just the city.
              Focus on standard European postal code formats.
              Default country is Slovakia if not specified.
            `,
          },
          {
            role: "user",
            content: `Extract shipping details from this text: "${text}". 
                     Return JSON with this structure:
                     {
                       "pickup": { "city": string, "zip": string? },
                       "delivery": { "city": string, "zip": string? },
                       "weight": number?,
                       "pallets": number?,
                       "pickupTime": string?,
                       "deliveryTime": string?
                     }`,
          },
        ],
        temperature: env.openai.TEMPERATURE,
        max_tokens: env.openai.MAX_TOKENS,
        response_format: { type: "json_object" },
      });

      const result = response.choices[0]?.message?.content;
      if (!result) return {};

      const parsedResult = JSON.parse(result);

      // Validácia lokácií (pripravené pre budúce použitie)
      if (parsedResult.pickup) {
        parsedResult.pickup = await this.validateLocation(parsedResult.pickup);
      }
      if (parsedResult.delivery) {
        parsedResult.delivery = await this.validateLocation(
          parsedResult.delivery
        );
      }

      await this.setCachedResponse(text, JSON.stringify(parsedResult));
      return parsedResult;
    } catch (error) {
      console.error("Error extracting data from text:", error);
      throw error;
    }
  }

  async processUserMessage(message: string): Promise<{
    extractedData: ExtractedData;
    aiResponse: string;
  }> {
    try {
      const extractedData = await this.extractDataFromText(message);

      const response = await this.openai.chat.completions.create({
        model: env.openai.MODEL,
        messages: [
          {
            role: "system",
            content: `
              You are a friendly logistics assistant.
              Respond to the user about their shipping request.
              If any important information is missing (pickup location, delivery location, weight, etc.),
              kindly ask for it.
              Use the same language as the user's message.
            `,
          },
          {
            role: "user",
            content: message,
          },
        ],
        temperature: env.openai.TEMPERATURE,
        max_tokens: env.openai.MAX_TOKENS,
      });

      const aiResponse =
        response.choices[0]?.message?.content ||
        "Sorry, I could not process your request.";

      return {
        extractedData,
        aiResponse,
      };
    } catch (error) {
      console.error("Error processing user message:", error);
      throw error;
    }
  }
}

export const aiService = new AIService();
