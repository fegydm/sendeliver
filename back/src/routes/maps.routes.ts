// File: ./back/src/routes/maps.routes.ts
// Updated router paths to avoid duplicate prefix when mounting in app

import express, { Request, Response } from 'express';
import { pool } from '../configs/db.js';
import mapsService from '../services/maps.services.js';

const router = express.Router();

// GET /boundaries
router.get('/boundaries', async (req: Request, res: Response) => {
  try {
    // Extract bbox and zoom from query parameters
    const { bbox, zoom } = req.query;
    // Set default zoom level to 2 if not provided
    const zoomLevel = zoom ? parseInt(zoom as string) : 2;
    let bboxArray: [number, number, number, number] | undefined;

    // Parse the bbox parameter (format: minLng,minLat,maxLng,maxLat)
    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = (bbox as string)
        .split(',')
        .map(Number);
      bboxArray = [minLng, minLat, maxLng, maxLat];
    }

    // Get GeoJSON data from the maps service
    const geojson = await mapsService.getCountriesGeoJson(zoomLevel, bboxArray);
    res.json(geojson);
  } catch (error) {
    // Log error for debugging purposes
    console.error('Failed to fetch boundaries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /boundaries/:id/color
router.put('/boundaries/:id/color', async (req: Request, res: Response) => {
  try {
    // Extract the boundary ID from the URL and colour from request body
    const { id } = req.params;
    const { colour } = req.body;

    // Update the boundary color using the maps service
    await mapsService.updateBoundaryColor(+id, colour);
    res.sendStatus(200);
  } catch (error) {
    // Log error for debugging
    console.error('Failed to update boundary color:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
