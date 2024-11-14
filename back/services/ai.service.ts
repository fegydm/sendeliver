// ./back/services/ai.service.ts
import { OpenAI } from "openai"; // Opravený import
import { AIRequest, AIResponse } from "@shared/types/ai.types";

export class AIService {
  private static API_URL = import.meta.env.VITE_AI_API_URL;
  private static instance: AIService;

  private openai: OpenAI;

  private constructor() {
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
      const response = await fetch(AIService.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Accept-Language": request.lang1 || "sk", // Použitie lang1
        },
        body: JSON.stringify(request),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API Error: ${response.status}`);
      }

      const content = await response.json();
      if (content && typeof content === "object" && content.data) {
        return content as AIResponse;
      } else {
        throw new Error("Invalid content type");
      }
    } catch (error: unknown) {
      console.error("AI Service Error:", error);
      throw new Error("An unknown error occurred.");
    }
  }
}
