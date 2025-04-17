// back/src/routes/maps.routes.ts
// Last change: 2025-04-17
// English comment: Fixed TypeScript error by defining params type for /tiles endpoint

import express, { Request, Response } from 'express';
import { pool } from '../configs/db.js';
import mapsService from '../services/maps.services.js';

const router = express.Router();

// GET /boundaries
router.get('/boundaries', async (req: Request, res: Response) => {
  try {
    const { bbox, zoom } = req.query;
    const zoomLevel = zoom ? parseInt(zoom as string) : 2;
    let bboxArray: [number, number, number, number] | undefined;

    if (bbox) {
      const [minLng, minLat, maxLng, maxLat] = (bbox as string)
        .split(',')
        .map(Number);
      bboxArray = [minLng, minLat, maxLng, maxLat];
    }

    const geojson = await mapsService.getCountriesGeoJson(zoomLevel, bboxArray);
    res.json(geojson);
  } catch (error) {
    console.error('Failed to fetch boundaries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /boundaries/:id/color
router.put('/boundaries/:id/color', async (req: Request, res: Response) => {
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

// GET /tiles/:z/:x/:y.pbf
interface TileParams {
  z: string;
  x: string;
  y: string;
}

router.get('/tiles/:z/:x/:y.pbf', async (req: Request<TileParams>, res: Response): Promise<void> => {
  try {
    const { z, x, y } = req.params;
    const type = req.query.type as string;

    if (type !== 'simple') {
      res.status(400).json({ error: 'Only simple layer is supported' });
      return;
    }

    const zoom = parseInt(z);
    const tileX = parseInt(x);
    const tileY = parseInt(y);

    const mvtBuffer = await mapsService.getRoadsTile(type, zoom, tileX, tileY);

    if (mvtBuffer.length === 0) {
      res.status(204).send();
      return;
    }

    res.setHeader('Content-Type', 'application/x-protobuf');
    res.send(mvtBuffer);
  } catch (error) {
    console.error(`Failed to serve tile ${req.params.z}/${req.params.x}/${req.params.y}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;