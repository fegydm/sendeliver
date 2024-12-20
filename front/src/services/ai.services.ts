// front/src/services/ai.service.ts
import { AIRequest, AIResponse } from "../types/ai.types";

export class AIService {
  private static API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:5000/api/ai/chat';

  static async sendMessage(request: AIRequest): Promise<AIResponse> {
    console.log('Request URL:', this.API_URL);  // Debug log
    console.log('Request data:', request);      // Debug log

    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Accept-Language": request.lang1 || "sk",
        },
        body: JSON.stringify(request),
        credentials: "include",
      });

      console.log('Response status:', response.status);  // Debug log

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.log('Error data:', errorData);  // Debug log
        throw new Error(errorData?.message || `API Error: ${response.status}`);
      }

      const content = await response.json();
      console.log('Response content:', content);  // Debug log
      
      if (content && typeof content === "object" && content.data) {
        return content as AIResponse;
      } else {
        throw new Error("Invalid content type");
      }
    } catch (error: unknown) {
      console.error("AI Service Error:", error);
      throw error; // Throwing original error for better debugging
    }
  }
}

export type { AIResponse };