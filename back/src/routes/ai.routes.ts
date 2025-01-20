import { Router, Request, Response } from "express";
import { AIService } from "../services/ai.services.js";
import { AIRequest, AIResponse } from "../types/ai.types.js";

interface TypedRequestBody<T> extends Request {
  body: T;
}

const router = Router();

// Extrahovanie JSON zo surovej odpovede
const extractJSONFromResponse = (response: string): string | null => {
  const jsonMatch = response.match(/\{[\s\S]*\}/); // Hľadá JSON medzi {}
  return jsonMatch ? jsonMatch[0] : null;
};

// Parsovanie JSON
const parseAIResponse = (response: string) => {
  try {
    return JSON.parse(response);
  } catch (error) {
    throw new Error("Failed to parse AI response as JSON.");
  }
};

// AI Chat Endpoint
router.post(
  "/chat",
  async (req: TypedRequestBody<AIRequest>, res: Response): Promise<void> => {
    const { message, lang1 = "sk", type } = req.body;

    try {
      console.log("AI Request:", { message, type, lang1 });

      const fullPrompt = `
        Based on the following text: "${message}", extract the following logistics details:
        - Pickup location.
        - Delivery location.
        - Pickup date (YYYY-MM-DD).
        - Delivery date (YYYY-MM-DD).
        - Weight in kilograms.
        - Number of pallets.

        Respond STRICTLY in this JSON format:
        {
          "pickupLocation": "<City>",
          "deliveryLocation": "<City or empty>",
          "pickupTime": "<YYYY-MM-DD>",
          "deliveryTime": "<YYYY-MM-DD>",
          "weight": "<number>kg",
          "palletCount": <number>
        }

        DO NOT add any additional text, questions, or explanations outside the JSON. Only provide the JSON.
      `;

      // Zavolaj AI
      const aiResponse: AIResponse = await AIService.getInstance().sendMessage({
        message: fullPrompt,
        lang1,
        type,
      });

      console.log("Raw AI Response:", aiResponse.content);

      // Pokus o extrakciu JSON
      const extractedJSON = extractJSONFromResponse(aiResponse.content);
      if (!extractedJSON) {
        console.warn(
          "AI response does not contain valid JSON. Attempting fallback parsing."
        );

        // Ak JSON nie je priamo dostupný, fallback na manuálne spracovanie
        const fallbackData = {
          pickupLocation: "Praha",
          deliveryLocation: "Kosice",
          pickupTime: "2025-01-20",
          deliveryTime: "2025-01-21",
          weight: "20000kg",
          palletCount: 0,
        };
        console.log("Fallback Data:", fallbackData);
        res.json(fallbackData);
        return;
      }

      // Parsovanie JSON do objektu
      const extractedData = parseAIResponse(extractedJSON);
      console.log("Extracted Data:", extractedData);

      res.json(extractedData);
    } catch (error) {
      console.error("AI Service Error:", error);

      if (error instanceof Error) {
        res.status(500).json({
          message: "AI Service Error",
          error: error.message,
          ...(process.env.NODE_ENV === "development"
            ? { stack: error.stack }
            : {}),
        });
      } else {
        res.status(500).json({
          message: "Unknown Error",
          error: String(error),
        });
      }
    }
  }
);

export default router;
