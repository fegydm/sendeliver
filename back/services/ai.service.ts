// ./back/services/ai.service.ts
import { openai, AI_CONFIG } from '../configs/openai.config';

interface ExtractedData {
  pickup?: string;
  delivery?: string;
  weight?: number;
  pallets?: number;
  pickupTime?: string;
  deliveryTime?: string;
}

class AIService {
  private async extractDataFromText(text: string): Promise<ExtractedData> {
    try {
      const response = await openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          { 
            role: 'system', 
            content: AI_CONFIG.systemPrompt 
          },
          {
            role: 'user',
            content: `Extract shipping details from this text: "${text}". 
                     Return only JSON with these possible fields: 
                     pickup, delivery, weight, pallets, pickupTime, deliveryTime`
          }
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.max_tokens,
        response_format: { type: "json_object" }
      });

      const result = response.choices[0]?.message?.content;
      return result ? JSON.parse(result) : {};
    } catch (error) {
      console.error('Error extracting data from text:', error);
      throw error;
    }
  }

  async processUserMessage(message: string): Promise<{
    extractedData: ExtractedData;
    aiResponse: string;
  }> {
    try {
      // Najprv extrahujeme dáta
      const extractedData = await this.extractDataFromText(message);

      // Potom získame odpoveď od AI
      const response = await openai.chat.completions.create({
        model: AI_CONFIG.model,
        messages: [
          { 
            role: 'system', 
            content: AI_CONFIG.systemPrompt 
          },
          {
            role: 'user',
            content: message
          }
        ],
        temperature: AI_CONFIG.temperature,
        max_tokens: AI_CONFIG.max_tokens
      });

      const aiResponse = response.choices[0]?.message?.content || 'Sorry, I could not process your request.';

      return {
        extractedData,
        aiResponse
      };
    } catch (error) {
      console.error('Error processing user message:', error);
      throw error;
    }
  }
}

export const aiService = new AIService();