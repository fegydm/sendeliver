// ./back/src/services/ai.services.ts
import { OpenAI } from "openai";
import { AIRequest, AIResponse } from "../types/";
import { AI_CONFIG } from "../configs/openai.config.js";
import path from "path";
import { fileURLToPath } from "url";

// Resolve __dirname in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(path.resolve(__dirname, "../../configs/openai.config"));

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

  async sendMessage(request: AIRequest): Promise<AIResponse> {
    try {
      const systemPrompt = `
        Si logistický AI asistent. Analyzuj požiadavku na prepravu a vráť JSON s nasledujúcou štruktúrou:
        {
          "pickupLocation": string,
          "deliveryLocation": string,
          "pickupTime": string,
          "deliveryTime": string | null,
          "weight": number | null,
          "palletCount": number | null,
          "additionalInfo": {
            "vehicleType": string | null,
            "requirements": string[] | null,
            "adr": boolean | null,
            "loadingType": string | null,
            "temperature": {
              "required": boolean,
              "min": number | null,
              "max": number | null
            }
          }
        }
        Kde neznáme hodnoty nastav na null.`;

      const completion = await this.openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: request.message },
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: 1000, // Optional: Limit tokens for response size
      });

      const content = completion.choices[0]?.message?.content || "{}";

      // Parse the JSON response
      try {
        const parsedData = JSON.parse(content);
        return {
          content,
          data: parsedData,
        };
      } catch (error) {
        console.error("Failed to parse AI response:", error);
        return {
          content,
          data: {},
        };
      }
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw error;
    }
  }
}
