// File: ./back/src/routes/verify-pin.routes.ts
// Last change: Fixed handler return type and removed duplicate code
import { Router, Request, Response, NextFunction } from 'express';
import { logger } from "@sendeliver/logger";

const router = Router();

// Map domains to environment PINs
const domainPins: Record<string, string | undefined> = {
  jozo: process.env.PIN_JOZO,
  luky: process.env.PIN_LUKY,
  hauler: process.env.PIN_HAULER,
  sender: process.env.PIN_SENDER
};

// POST /api/verify-pin
router.post("/", (req: Request, res: Response, next: NextFunction): void => {
  const { domain, pin } = req.body as { domain?: string; pin?: string };

  // Validate input
  if (!domain || !pin) {
    logger.warn("verify-pin: missing domain or pin", { domain, pin });
    res.status(400).json({ success: false, error: "Missing domain or pin" });
    return;
  }

  const expected = domainPins[domain];
  logger.info("verify-pin attempt", { domain, hasEnv: Boolean(expected) });

  // Check PIN
  if (!expected || pin !== expected) {
    logger.warn("verify-pin failed", { domain });
    res.status(401).json({ success: false, error: "Unauthorized" });
    return;
  }

  // Success
  logger.info("verify-pin succeeded", { domain });
  res.status(200).json({ success: true });
});

export default router;
