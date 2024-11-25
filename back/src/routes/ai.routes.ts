// ./back/src/routes/ai.routes.ts
import { Router, Request, Response } from "express";
import { AIService } from "../services/ai.services";
import { AIRequest, AIResponse } from "../types/ai.types";

interface TypedRequestBody<T> extends Request {
  body: T;
}

const router = Router();

router.post(
  "/chat",
  async (req: TypedRequestBody<AIRequest>, res: Response) => {
    const { message, lang1 = "sk", type } = req.body;

    try {
      console.log("AI Request:", { message, type, lang1 });

      const aiResponse: AIResponse = await AIService.getInstance().sendMessage({
        message,
        lang1,
        type,
      });

      console.log("AI Response:", JSON.stringify(aiResponse, null, 2));

      res.json(aiResponse);
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

export { router };
