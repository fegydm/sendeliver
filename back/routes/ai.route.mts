// ./back/routes/ai.route.ts
import { Router, Request, Response, NextFunction } from "express";
import { body, validationResult } from "express-validator";
import { aiService } from "../services/ai.service.mjs";

const router = Router();

// Custom error class
class APIError extends Error {
  status: number;
  errors?: any[];

  constructor(status: number, message: string, errors?: any[]) {
    super(message);
    this.status = status;
    this.errors = errors;
  }
}

/**
 * @route   POST /api/ai/process
 * @desc    Process user message with AI
 * @access  Private (bude potrebné pridať auth middleware)
 */
router.post(
  "/process",
  [
    body("message")
      .trim()
      .notEmpty()
      .withMessage("Message is required")
      .isString()
      .withMessage("Message must be a string")
      .isLength({ min: 10, max: 500 })
      .withMessage("Message must be between 10 and 500 characters"),
  ],
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validácia requestu
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        throw new APIError(400, "Validation Error", errors.array());
      }

      // Spracovanie správy
      const { message } = req.body;
      const result = await aiService.processUserMessage(message);

      // Cache kontrola
      res.setHeader("Cache-Control", "private, max-age=3600");

      return res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
