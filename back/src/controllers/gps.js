// back/src/controllers/gps.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

export async function saveGps(req, res) {
  try {
    const { truckId, latitude, longitude, timestamp } = req.body;
    const gpsLog = await prisma.gpsLog.create({
      data: { truckId, latitude, longitude, timestamp: new Date(timestamp) },
    });
    res.status(201).json(gpsLog);
  } catch (error) {
    res.status(500).json({ error: 'Failed to save GPS' });
  }
}