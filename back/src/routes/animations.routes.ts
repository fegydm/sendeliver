// File: back/src/routes/animations.routes.ts
import express, { Request, Response } from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/", (_req: Request, res: Response) => {
  const animationsDir = path.join(process.cwd(), "front/public/animations");

  fs.readdir(animationsDir, (err, files) => {
    if (err) {
      console.error("Error reading animations directory:", err);
      res.status(500).json({ error: "Failed to load animations." });
      return;
    }

    const animations = files.filter(
      (file) => file.endsWith(".json") || file.endsWith(".svg")
    );

    res.json(animations);
  });
});

export default router;
