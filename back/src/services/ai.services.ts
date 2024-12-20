// ./back/src/services/ai.services.ts
import { OpenAI } from "openai";
import { AIRequest, AIResponse } from "../types/";
import { AI_CONFIG } from "../configs/openai.config.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface AIData {
  pickupLocation: string;
  deliveryLocation: string;
  pickupTime: string;
  deliveryTime: string;
  weight: string;
  palletCount: number;
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

  static getInstance(): AIService {
    if (!this.instance) {
      this.instance = new AIService();
    }
    return this.instance;
  }

  private getDefaultDates() {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return {
      today: today.toISOString().split('T')[0],
      tomorrow: tomorrow.toISOString().split('T')[0]
    };
  }

  async sendMessage(request: AIRequest): Promise<AIResponse> {
    try {
      const language = request.lang1 || "en";
      const dates = this.getDefaultDates();

      const systemPromptText = `You are a logistics AI assistant. Respond in this exact format:

1. A friendly message that summarizes the request and asks for any additional details.

2. Then on a new line, provide this exact JSON (no additional text, just the JSON):
{
  "pickupLocation": "city name only",
  "deliveryLocation": "city name only",
  "pickupTime": "YYYY-MM-DD",
  "deliveryTime": "YYYY-MM-DD",
  "weight": "string (in kg, e.g., '500kg')",
  "palletCount": number
}

Important:
- Use precisely this JSON format with these exact field names
- Put the JSON on a new line after your message
- Don't add any text before or after the JSON
- For locations, use only city names, without country or address
- Respond in language: ${language}

Default values to use if information is not provided:
- Empty string for locations
- Today (${dates.today}) for pickup time
- Tomorrow (${dates.tomorrow}) for delivery time
- "0kg" for weight
- 0 for pallet count`;

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
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      
      // Defaultné hodnoty
      const defaultData: AIData = {
        pickupLocation: "",
        deliveryLocation: "",
        pickupTime: dates.today,
        deliveryTime: dates.tomorrow,
        weight: "0kg",
        palletCount: 0,
      };

      let messageContent = content;
      let data = { ...defaultData };

      if (jsonMatch) {
        try {
          messageContent = content.substring(0, jsonMatch.index).trim();
          const parsedData = JSON.parse(jsonMatch[0]);

          // Spracovanie a validácia každého poľa
          data = {
            pickupLocation: parsedData.pickupLocation?.trim() || defaultData.pickupLocation,
            deliveryLocation: parsedData.deliveryLocation?.trim() || defaultData.deliveryLocation,
            pickupTime: this.validateDate(parsedData.pickupTime) ? parsedData.pickupTime : defaultData.pickupTime,
            deliveryTime: this.validateDate(parsedData.deliveryTime) ? parsedData.deliveryTime : defaultData.deliveryTime,
            weight: this.validateWeight(parsedData.weight) ? parsedData.weight : defaultData.weight,
            palletCount: this.validatePalletCount(parsedData.palletCount) ? parsedData.palletCount : defaultData.palletCount
          };

          console.log('Extracted data:', data);
        } catch (error) {
          console.error("Failed to parse JSON:", error);
          console.log("Raw JSON string:", jsonMatch[0]);
        }
      } else {
        console.log('No JSON found in response, using defaults:', defaultData);
      }

      return {
        content: messageContent,
        data: data,
      };
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw error;
    }
  }

  private validateDate(date: string): boolean {
    if (!date) return false;
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    return dateRegex.test(date) && !isNaN(Date.parse(date));
  }

  private validateWeight(weight: string): boolean {
    if (!weight) return false;
    return /^\d+kg$/.test(weight);
  }

  private validatePalletCount(count: number): boolean {
    return typeof count === 'number' && count >= 0 && count <= 33;
  }
}