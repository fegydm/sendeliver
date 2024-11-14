import { Router, Request, Response } from "express";
import { AIService } from "../services/ai.service";  // .ts prípona
import { AIRequest, AIResponse } from "@shared/types/ai.types"; // .ts prípona

interface TypedRequestBody<T> extends Request {
  body: T
}

const router = Router();

router.post(
  "/send", 
  async (
    req: TypedRequestBody<AIRequest>, 
    res: Response
  ) => {
    const { message, lang1 = "sk", type } = req.body;

    try {
      const aiResponse: AIResponse = await AIService.getInstance().sendMessage({
        message,
        lang1,
        type,
      });

      res.json(aiResponse);
    } catch (error) {
      console.error("AI Service Error:", error);
      
      if (error instanceof Error) {
        res.status(500).json({ 
          message: "AI Service Error", 
          error: error.message,
          ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
        });
      } else {
        res.status(500).json({ 
          message: "Unknown Error",
          error: String(error)
        });
      }
    }
  }
);

export { router };