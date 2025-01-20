// File: src/routes/geo.routes.ts
// Last change: Fixed typing for router post handler

import { Router, Request, Response } from "express";
import { GeocodingService } from "../services/geocoding.services.js";

interface GeoRequestBody {
 location: string;
}

const router = Router();

router.post(
 "/", 
 async (
   req: Request<{}, {}, GeoRequestBody>, 
   res: Response
 ) => {
   const { location } = req.body;

   if (!location) {
     res.status(400).json({ error: "Location is required." });
     return;
   }

   try {
     const coordinates = await GeocodingService.getInstance().getCoordinates(location);
     res.json(coordinates);
   } catch (error) {
     console.error("Error fetching coordinates:", error);
     res.status(500).json({ error: "Failed to fetch coordinates." });
   }
 }
);

export default router;