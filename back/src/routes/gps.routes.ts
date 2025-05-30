// File: ./back/src/routes/gps.routes.ts
// Last change: Updated import to gps.services.ts

import { Router, Request, Response } from 'express';
import * as gpsService from '../services/gps.services.js';

const router = Router();

router.post('/', async (req: Request, res: Response) => {
  try {
    const { vehicleId, latitude, longitude, accuracy, altitude, timestamp } = req.body;
    if (!vehicleId || !latitude || !longitude || !timestamp) {
      return res.status(400).json({ error: 'Missing required fields: vehicleId, latitude, longitude, timestamp' });
    }
    await gpsService.saveGpsData({
      vehicleId,
      latitude,
      longitude,
      accuracy,
      altitude,
      timestamp: new Date(timestamp),
    });
    res.status(200).json({ message: 'GPS data saved' });
  } catch (error) {
    console.error('[GPS] Route error:', error);
    res.status(500).json({ error: 'Failed to save GPS data' });
  }
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const { vehicleId, limit = '10' } = req.query;
    const gpsData = await gpsService.getGpsData({
      vehicleId: vehicleId ? String(vehicleId) : undefined,
      limit: parseInt(String(limit), 10),
    });
    res.status(200).json(gpsData);
  } catch (error) {
    console.error('[GPS] GET Route error:', error);
    res.status(500).json({ error: 'Failed to fetch GPS data' });
  }
});

export default router;