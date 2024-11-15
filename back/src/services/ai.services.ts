// ./back/services/ai.service.ts
import { OpenAI } from "openai";
import { AIRequest, AIResponse } from "@shared/types/ai.types";
import dotenv from "dotenv";

dotenv.config();

export class AIService {
  private static instance: AIService;
  private openai: OpenAI;
  private readonly systemMessages = {
    sender:
      "You are a logistics assistant helping senders to create transport requests. Extract structured information from the message and respond in the same language as the input message. If lang1 parameter is provided, respond in that language.",
    carrier:
      "You are a logistics assistant helping carriers to understand transport requests. Analyze the request and provide structured information about cargo and requirements. If lang1 parameter is provided, respond in that language.",
  };

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
      const prompt = this.createPrompt(request);

      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: this.systemMessages[request.type],
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        model: "gpt-3.5-turbo",
        temperature: 0.7,
        max_tokens: 1000,
      });

      const content = completion.choices[0].message.content || "";

      return {
        content: content,
        data: this.extractStructuredData(content),
      };
    } catch (error: unknown) {
      console.error("OpenAI API Error:", error);
      throw new Error("An error occurred while processing your request");
    }
  }

  private createPrompt(request: AIRequest): string {
    let prompt = request.message;

    // Add language instruction if specified
    if (request.lang1) {
      prompt += `\n\nPlease respond in ${request.lang1} language.`;
    }

    // Add specific instructions based on type
    if (request.type === "sender") {
      prompt += `\n\nPlease extract the following information and include it in a JSON block:
      - Pickup location and time
      - Delivery location and time
      - Weight and pallet count
      - Vehicle type needed
      - Special requirements (ADR, temperature, loading type)
      - Additional information`;
    } else {
      prompt += `\n\nPlease analyze this transport request and provide:
      - Detailed cargo information
      - Required vehicle specifications
      - Estimated price and distance
      - Special handling requirements
      Include this information in a JSON block.`;
    }

    return prompt;
  }

  private extractStructuredData(content: string): AIResponse["data"] {
    try {
      // Attempt to find JSON block in the response
      const jsonMatch =
        content.match(/```json\n([\s\S]*?)\n```/) ||
        content.match(/{[\s\S]*?}/);

      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0].replace(/```json\n|```/g, ""));

        // Validate and structure the data according to AIResponse interface
        return {
          pickupLocation: data.pickupLocation,
          deliveryLocation: data.deliveryLocation,
          pickupTime: data.pickupTime,
          deliveryTime: data.deliveryTime,
          weight: data.weight,
          palletCount: data.palletCount,
          additionalInfo: {
            vehicleType: data.vehicleType || data.additionalInfo?.vehicleType,
            requirements:
              data.requirements || data.additionalInfo?.requirements,
            price: data.price || data.additionalInfo?.price,
            distance: data.distance || data.additionalInfo?.distance,
            adr: data.adr || data.additionalInfo?.adr,
            loadingType: data.loadingType || data.additionalInfo?.loadingType,
            temperature: data.temperature || data.additionalInfo?.temperature,
          },
        };
      }

      return {};
    } catch (error) {
      console.warn("Failed to parse structured data from AI response:", error);
      return {};
    }
  }
}
