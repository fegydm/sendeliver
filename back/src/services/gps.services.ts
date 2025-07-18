// File: back/src/services/gps.services.ts
// Description: Handles storage of GPS data and broadcasting updates.

import { PrismaClient, GpsData as PrismaGpsData } from '@prisma/client';

const prisma = new PrismaClient();

// Defines incoming GPS data payload, consistent with device input.
interface GpsDataPayload {
  deviceIdentifier: string; // Changed from vehicleId to deviceIdentifier
  latitude: number;
  longitude: number;
  speed?: number;
  timestamp: string; // ISO string from device
  accuracy?: number;
  heading?: number;
  altitude?: number;
}

/**
 * Stores GPS data in the database using Prisma.
 * @param gpsData The GPS data payload received from a device.
 * @returns A promise that resolves to the created GpsData record.
 */
export async function storeGPSData(gpsData: GpsDataPayload): Promise<PrismaGpsData> {
  // Log attempt to find device and store data.
  console.log('[GPS Storage] Attempting to store data for device:', gpsData.deviceIdentifier);
  
  try {
    // Find the trackable device by its identifier.
    const trackableDevice = await prisma.trackableDevice.findUnique({
      where: { deviceIdentifier: gpsData.deviceIdentifier },
      select: { id: true } // Select only the ID
    });

    // If device not found, throw an error.
    if (!trackableDevice) {
      throw new Error(`Trackable device with identifier ${gpsData.deviceIdentifier} not found.`);
    }

    // Create GPS data record using trackableDeviceId.
    const createdGpsData = await prisma.gpsData.create({
      data: {
        trackableDeviceId: trackableDevice.id, // Use the found trackableDeviceId
        latitude: gpsData.latitude,
        longitude: gpsData.longitude,
        timestamp: new Date(gpsData.timestamp), // Convert ISO string to Date
        accuracy: gpsData.accuracy,
        speed: gpsData.speed,
        heading: gpsData.heading,
        altitude: gpsData.altitude,
      }
    });
    // Log successful data storage.
    console.log('[GPS Storage] Data stored successfully. ID:', createdGpsData.id);
    return createdGpsData;
  } catch (error) {
    // Log and re-throw error if storage fails.
    console.error('[GPS Storage] Error storing data:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any).code || 'N/A',
      meta: (error as any).meta || 'N/A',
    });
    throw new Error(`Failed to store GPS data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieves GPS data from the database based on optional device ID and limit.
 * @param options - Object with optional trackableDeviceId and required limit.
 * @returns A promise that resolves to an array of GpsData records.
 */
export async function getGpsData({ trackableDeviceId, limit }: { trackableDeviceId?: number; limit: number }): Promise<PrismaGpsData[]> {
  try {
    // Build query options for findMany.
    const queryOptions: any = {
      take: limit,
    };

    // Add where clause if trackableDeviceId is provided.
    if (trackableDeviceId) {
      queryOptions.where = { trackableDeviceId: trackableDeviceId };
    }

    // Fetch results and sort in-memory by timestamp descending.
    const results = await prisma.gpsData.findMany(queryOptions);
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return results;
  } catch (error) {
    // Log and re-throw error if retrieval fails.
    console.error('[GPS] Get service error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      code: (error as any).code || 'N/A',
      meta: (error as any).meta || 'N/A',
    });
    throw new Error(`Failed to retrieve GPS data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Broadcasts a GPS update to connected WebSocket clients.
 * @param gpsData The GPS data payload to broadcast.
 */
export function broadcastGPSUpdate(gpsData: GpsDataPayload): void {
  // Log broadcast attempt.
  console.log('[GPS Broadcast] Broadcasting update for device:', gpsData.deviceIdentifier);
  
  // This part needs your WebSocket server instance (e.g., global.wsServer).
  // Example WebSocket broadcast (uncomment and adapt to your WS setup):
  // if (global.wsServer && global.wsServer.clients) {
  //   global.wsServer.clients.forEach((client: any) => {
  //     if (client.readyState === WebSocket.OPEN) {
  //       client.send(JSON.stringify({
  //         type: 'device_moved', // Event type for device movement
  //         payload: {
  //           deviceIdentifier: gpsData.deviceIdentifier,
  //           latitude: gpsData.latitude,
  //           longitude: gpsData.longitude,
  //           speed: gpsData.speed,
  //           timestamp: gpsData.timestamp
  //         }
  //       }));
  //     }
  //   });
  // } else {
  //   console.warn('[GPS Broadcast] WebSocket server instance not found or clients not available.');
  // }
}