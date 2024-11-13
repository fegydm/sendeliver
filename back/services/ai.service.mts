import OpenAI from "openai";
import { AIRequest, AIResponse } from "../types/ai.types";

export class AIService {
  private openai: OpenAI;

  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async processMessage(request: AIRequest): Promise<AIResponse> {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4-0125-preview",
        messages: [
          {
            role: "system",
            content: this.getSystemPrompt(request.type, request.language),
          },
          {
            role: "user",
            content: request.message,
          },
        ],
        response_format: { type: "json_object" },
        temperature: 0.7,
      });

      const response = JSON.parse(completion.choices[0].message.content);
      return {
        content: response.content,
        data: response.data,
      };
    } catch (error) {
      console.error("OpenAI Service Error:", error);
      throw error;
    }
  }

  private getSystemPrompt(
    type: "sender" | "carrier",
    language: string = "sk"
  ): string {
    const basePrompt =
      language === "sk"
        ? "Si asistent pre logistickú platformu. "
        : "You are an assistant for a logistics platform. ";

    if (type === "sender") {
      return (
        basePrompt +
        (language === "sk"
          ? "Pomáhaš odosielateľom analyzovať ich požiadavky na prepravu."
          : "You help senders analyze their shipping requirements.")
      );
    } else {
      return (
        basePrompt +
        (language === "sk"
          ? "Pomáhaš prepravcom nájsť vhodné zákazky."
          : "You help carriers find suitable shipping jobs.")
      );
    }
  }
}

export const aiService = new AIService();
