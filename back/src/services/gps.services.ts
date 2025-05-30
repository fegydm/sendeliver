import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface GpsData {
  vehicleId: string;
  latitude: number;
  longitude: number;
  accuracy?: number;
  altitude?: number;
  timestamp: Date;
}

export async function saveGpsData(data: GpsData): Promise<void> {
  try {
    console.log('[GPS] Input data:', data);
    await prisma.gpsData.create({
      data: {
        vehicleId: data.vehicleId,
        latitude: data.latitude,
        longitude: data.longitude,
        accuracy: data.accuracy,
        altitude: data.altitude,
        timestamp: data.timestamp,
      },
    });
  } catch (error: unknown) {
    console.error('[GPS] Service error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any).code || 'No code',
      meta: (error as any).meta || 'No meta',
    });
    throw error;
  }
}

export async function getGpsData({ vehicleId, limit }: { vehicleId?: string; limit: number }) {
  try {
    return await prisma.gpsData.findMany({
      where: vehicleId ? { vehicleId: vehicleId } : {},
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  } catch (error: unknown) {
    console.error('[GPS] Get service error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any).code || 'No code',
      meta: (error as any).meta || 'No meta',
    });
    throw error;
  }
}