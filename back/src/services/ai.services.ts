// ./back/src/services/ai.services.ts
import { OpenAI } from "openai";
import { AIRequest, AIResponse } from "../types/";
import { AI_CONFIG } from "../configs/openai.config.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
      const language = request.lang1 || 'en';
      
      const systemPromptText = `You are a logistics AI assistant. Provide your response in two parts:

1. First write a friendly message that:
- Summarizes what you understand about the shipping request
- Asks if they want to add any details
- Mentions they can specify everything in the form below

2. Then add a JSON object with shipping details. Do not use any markdown formatting or code blocks.

Your response must follow this exact format:
---MESSAGE START---
[Your friendly message here]
---MESSAGE END---
---JSON START---
{
  "pickupLocation": "string",
  ...rest of the json structure
}
---JSON END---`;

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

      // Extract message and JSON parts
      const messageMatch = content.match(/---MESSAGE START---([\s\S]*?)---MESSAGE END---/);
      const jsonMatch = content.match(/---JSON START---([\s\S]*?)---JSON END---/);

      let data = {};
      let humanResponse = messageMatch ? messageMatch[1].trim() : "";

      if (jsonMatch) {
        try {
          const jsonString = jsonMatch[1].trim();
          data = JSON.parse(jsonString);
        } catch (error) {
          console.error("Failed to parse JSON:", error);
          console.log("Raw JSON string:", jsonMatch[1]);
        }
      }

      return {
        content: humanResponse,
        data: data,
      };
    } catch (error) {
      console.error("OpenAI API Error:", error);
      throw error;
    }
  }
}