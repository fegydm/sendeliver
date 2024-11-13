import { AIRequest, AIResponse } from "@/types/ai.types";

export class AIService {
  private static API_URL = import.meta.env.VITE_AI_API_URL;

  static async sendMessage(request: AIRequest): Promise<AIResponse> {
    try {
      const response = await fetch(this.API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Accept-Language": request.language || "sk",
        },
        body: JSON.stringify(request),
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `API Error: ${response.status}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error("AI Service Error:", error);
      if (error.message.includes("Failed to fetch")) {
        throw new Error(
          "Nepodarilo sa spojiť so serverom. Skontrolujte prosím vaše internetové pripojenie."
        );
      }
      throw error;
    }
  }
}
