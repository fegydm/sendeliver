// File: back/src/routes/maps.routes.ts
// Last change: 2025-04-22
// Description: Updated routes to support MVT generation and Slovak tiles under the correct path

import express, { Request as ExpressRequest, Response } from 'express';
import mapsService from '../services/maps.services.js';

const router = express.Router();

// Create a typed request interface
interface TypedRequest<P = {}, Q = {}, B = {}> extends ExpressRequest {
  params: P;
  query: Q;
  body: B;
}

// Note: This router should be mounted at '/api/maps' in your main server file

// GET /api/maps/boundaries
router.get('/boundaries', async (req: TypedRequest<{}, { bbox?: string, zoom?: string }>, res: Response) => {
  try {
    const { bbox, zoom } = req.query;
    const zoomLevel = zoom ? parseInt(zoom as string, 10) : 2;
    let bboxArray: [number, number, number, number] | undefined;

    if (bbox) {
      // Convert bbox string "minLng,minLat,maxLng,maxLat" to number array
      const [minLng, minLat, maxLng, maxLat] = (bbox as string)
        .split(',')
        .map(Number);
      bboxArray = [minLng, minLat, maxLng, maxLat];
    }

    // Retrieve GeoJSON of countries, optionally clipped to bbox
    const geojson = await mapsService.getCountriesGeoJson(zoomLevel, bboxArray);
    res.json(geojson);
  } catch (error) {
    console.error('Failed to fetch boundaries:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define interface for color update request body
interface ColorUpdateBody {
  colour: string;
}

// PUT /api/maps/boundaries/:id/color
router.put('/boundaries/:id/color', async (
  req: TypedRequest<{ id: string }, {}, ColorUpdateBody>, 
  res: Response
) => {
  try {
    const { id } = req.params;
    const { colour } = req.body;

    // Update color for a specific boundary
    await mapsService.updateBoundaryColor(+id, colour);
    res.sendStatus(200);
  } catch (error) {
    console.error('Failed to update boundary color:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Define TileParams type for z, x, y params
interface TileParams {
  z: string;
  x: string;
  y: string;
}

// Define TileQuery type for the optional layer parameter
interface TileQuery {
  layer?: string;
}

// GET /api/maps/tiles/:z/:x/:y.mvt
router.get('/tiles/:z/:x/:y.mvt', async (
  req: TypedRequest<TileParams, TileQuery>, 
  res: Response
): Promise<void> => {
  try {
    const { z, x, y } = req.params;
    // Optional layer query, default to 'boundaries'
    const layer = (req.query.layer as string) || 'boundaries';

    // Validate numeric tile parameters
    const zoom = parseInt(z, 10);
    const tileX = parseInt(x, 10);
    const tileY = parseInt(y, 10);

    if (isNaN(zoom) || isNaN(tileX) || isNaN(tileY)) {
      res.status(400).json({ error: 'Invalid tile coordinates' });
      return;
    }

    let mvtBuffer: Buffer;

    // Choose service based on layer
    switch (layer) {
      case 'boundaries':
        mvtBuffer = await mapsService.getBoundariesMVT(zoom, tileX, tileY);
        break;
      case 'roads':
        mvtBuffer = await mapsService.getRoadsTile(zoom, tileX, tileY);
        break;
      default:
        res.status(400).json({ error: `Unsupported layer: ${layer}` });
        return;
    }

    // No content when empty buffer
    if (!mvtBuffer?.length) {
      res.sendStatus(204);
      return;
    }

    // Set headers and send MVT
    res.setHeader('Content-Type', 'application/x-protobuf');
    res.setHeader('Cache-Control', 'public, max-age=86400'); // cache 24h
    res.send(mvtBuffer);
  } catch (error) {
    console.error(`MVT Tile error ${req.params.z}/${req.params.x}/${req.params.y}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET /api/maps/tiles/sk/:z/:x/:y.mvt - special Slovak boundaries
router.get('/tiles/sk/:z/:x/:y.mvt', async (
  req: TypedRequest<TileParams>, 
  res: Response
): Promise<void> => {
  try {
    const { z, x, y } = req.params;
    const zoom = parseInt(z, 10);
    const tileX = parseInt(x, 10);
    const tileY = parseInt(y, 10);

    // Validate numeric tile parameters
    if (isNaN(zoom) || isNaN(tileX) || isNaN(tileY)) {
      res.status(400).json({ error: 'Invalid tile coordinates' });
      return;
    }

    // Get MVT filtered for Slovakia (code_2 = 'SK')
    const mvtBuffer = await mapsService.getCountryBoundariesMVT(zoom, tileX, tileY, 'SK');

    if (!mvtBuffer?.length) {
      res.sendStatus(204);
      return;
    }

    // Set headers and send MVT
    res.setHeader('Content-Type', 'application/x-protobuf');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(mvtBuffer);
  } catch (error) {
    console.error(`SK MVT Tile error ${req.params.z}/${req.params.x}/${req.params.y}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;