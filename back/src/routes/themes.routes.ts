// .back/src/routes/themes.routes.ts

import { Router } from "express";
import { getThemes, updateTheme } from "../controllers/themes.controllers";

const router = Router();

router.get("/", getThemes);
router.post("/update", updateTheme);

export default router;
