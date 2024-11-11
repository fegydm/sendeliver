// ./front/src/services/ai.service.ts
export interface AIRequest {
    message: string;
    type: 'sender' | 'carrier';  // Aby AI vedelo či ide o odosielateľa alebo prepravcu
    language?: string;           // Prípadná podpora viacerých jazykov
  }
  
  export interface AIResponse {
    content: string;            // Celá odpoveď pre zobrazenie užívateľovi
    data?: {                    // Štruktúrované dáta pre formulár
      pickupLocation?: string;
      deliveryLocation?: string;
      pickupTime?: string;
      deliveryTime?: string;
      weight?: number;
      palletCount?: number;
      additionalInfo?: {        // Ďalšie možné údaje
        vehicleType?: string;
        requirements?: string[];
        price?: number;
        distance?: number;
      }
    }
  }
  
  export class AIService {
    private static API_URL = 'https://api.example.com/ai/chat'; // Nahraďte vašou URL
  
    static async sendMessage(request: AIRequest): Promise<AIResponse> {
      try {
        const response = await fetch(this.API_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            // Pridajte prípadné API kľúče alebo autentifikáciu
            'Authorization': `Bearer ${process.env.REACT_APP_AI_API_KEY}`
          },
          body: JSON.stringify(request)
        });
  
        if (!response.ok) {
          throw new Error(`API Error: ${response.status}`);
        }
  
        return await response.json();
      } catch (error) {
        console.error('AI Service Error:', error);
        throw error;
      }
    }
  }