// File: back/src/routes/animations.routes.ts
// Last change: Fixed TypeScript errors related to express Response methods

import express from "express";
import fs from "fs";
import path from "path";

const router = express.Router();

router.get("/", (_req: any, res: any) => {
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