// front/src/services/ai.service.ts
import { AIRequest, AIResponse } from "../types/ai.types"; // AIResponse

export class AIService {
  private static API_URL = import.meta.env.VITE_AI_API_URL;

  static async sendMessage(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await fetch(AIService.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Accept-Language": request.lang1 || "sk", // Using lang1
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

// Export the AIResponse from the same file so it can be used in other files
export type { AIResponse };
