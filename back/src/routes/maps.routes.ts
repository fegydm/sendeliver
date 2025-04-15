// File: ./back/src/routes/maps.routes.ts
// Last change: Updated to use MapsService.getCountriesGeoJson for /api/maps/boundaries

import express, { Request, Response } from 'express';
import { pool } from '../configs/db.js';
import mapsService from '../services/maps.services.js';

const router = express.Router();

// GET /api/maps/boundaries
router.get('/api/maps/boundaries', async (req: Request, res: Response) => {
  try {
    const { bbox, zoom } = req.query;
    const zoomLevel = zoom ? parseInt(zoom as string) : 2; 
    let bboxArray: [number, number, number, number] | undefined;

    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = (bbox as string).split(',').map(Number);
      bboxArray = [minLng, minLat, maxLng, maxLat];
    }

    const geojson = await mapsService.getCountriesGeoJson(zoomLevel, bboxArray);
    res.json(geojson);
  } catch (error) {
    console.error('Failed to fetch boundaries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /api/maps/boundaries/:id/color
router.put('/api/maps/boundaries/:id/color', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { colour } = req.body;
    await mapsService.updateBoundaryColor(+id, colour);
    res.sendStatus(200);
  } catch (error) {
    console.error('Failed to update boundary color:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;