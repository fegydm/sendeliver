import { OpenAI } from "openai";
import { AIRequest, AIResponse } from "@shared/types/ai.types";
import dotenv from 'dotenv';

dotenv.config();

export class AIService {
  private static instance: AIService;
  private openai: OpenAI;

  private constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
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
      const completion = await this.openai.chat.completions.create({
        messages: [{ role: "user", content: request.message }],
        model: "gpt-3.5-turbo",
      });

      // Získame text odpovede
      const content = completion.choices[0].message.content || "";
      
      // Základná odpoveď
      const response: AIResponse = {
        content: content,
        data: {} // prázdny objekt pre voliteľné dáta
      };

      // Tu môžete pridať logiku na parsovanie content do štruktúrovaných dát
      // ak ich AI poskytuje v nejakom formáte (JSON, atď.)

      return response;

    } catch (error: unknown) {
      console.error("OpenAI API Error:", error);
      throw new Error("An error occurred while processing your request");
    }
  }
}