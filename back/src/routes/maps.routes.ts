// File: back/src/routes/maps.routes.ts
// Last change: Corrected parameter types to satisfy the ParamsDictionary constraint.

import { Router, Request, Response, NextFunction } from 'express';
import { ParamsDictionary } from 'express-serve-static-core';
import mapsService from '../services/maps.services.js';

const router = Router();

interface TypedRequest<P extends ParamsDictionary = {}, Q = {}, B = {}> extends Request<P, any, B, Q> {
  params: P;
  query: Q;
  body: B;
}

router.get('/boundaries', async (req: TypedRequest<{}, { bbox?: string, zoom?: string }>, res: Response) => {
  try {
    const { bbox, zoom } = req.query;
    const zoomLevel = zoom ? parseInt(zoom as string, 10) : 2;
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

interface ColorUpdateBody {
  colour: string;
}

interface BoundaryParams extends ParamsDictionary {
  id: string;
}

router.put('/boundaries/:id/color', async (
  req: TypedRequest<BoundaryParams, {}, ColorUpdateBody>, 
  res: Response
) => {
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

interface TileParams extends ParamsDictionary {
  z: string;
  x: string;
  y: string;
}

interface TileQuery {
  layer?: string;
}

router.get('/tiles/:z/:x/:y.mvt', async (
  req: TypedRequest<TileParams, TileQuery>, 
  res: Response
): Promise<void> => {
  try {
    const { z, x, y } = req.params;
    const layer = (req.query.layer as string) || 'boundaries';

    const zoom = parseInt(z, 10);
    const tileX = parseInt(x, 10);
    const tileY = parseInt(y, 10);

    if (isNaN(zoom) || isNaN(tileX) || isNaN(tileY)) {
      res.status(400).json({ error: 'Invalid tile coordinates' });
      return;
    }

    let mvtBuffer: Buffer;

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

    if (!mvtBuffer?.length) {
      res.sendStatus(204);
      return;
    }

    res.setHeader('Content-Type', 'application/x-protobuf');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(mvtBuffer);
  } catch (error) {
    console.error(`MVT Tile error ${req.params.z}/${req.params.x}/${req.params.y}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/tiles/sk/:z/:x/:y.mvt', async (
  req: TypedRequest<TileParams>, 
  res: Response
): Promise<void> => {
  try {
    const { z, x, y } = req.params;
    const zoom = parseInt(z, 10);
    const tileX = parseInt(x, 10);
    const tileY = parseInt(y, 10);

    if (isNaN(zoom) || isNaN(tileX) || isNaN(tileY)) {
      res.status(400).json({ error: 'Invalid tile coordinates' });
      return;
    }

    const mvtBuffer = await mapsService.getCountryBoundariesMVT(zoom, tileX, tileY, 'SK');

    if (!mvtBuffer?.length) {
      res.sendStatus(204);
      return;
    }

    res.setHeader('Content-Type', 'application/x-protobuf');
    res.setHeader('Cache-Control', 'public, max-age=86400');
    res.send(mvtBuffer);
  } catch (error) {
    console.error(`SK MVT Tile error ${req.params.z}/${req.params.x}/${req.params.y}:`, error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
