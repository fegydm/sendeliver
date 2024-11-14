// ./back/routes/ai.route.ts
import { Router } from "express";
import { AIService } from "../services/ai.service";
import { AIRequest, AIResponse } from "@shared/types/ai.types";

const router = Router();

router.post("/send", async (req, res) => {
  const { message, lang1 = "sk", type }: AIRequest = req.body;

  try {
    const aiResponse: AIResponse = await AIService.getInstance().sendMessage({
      message,
      lang1,
      type,
    });

    res.json(aiResponse);
  } catch (error) {
    res.status(500).json({ message: "An error occurred", error });
  }
});

export { router };
