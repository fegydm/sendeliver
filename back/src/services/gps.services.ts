// File: back/src/services/gps.services.ts
// Description: Handles storage of GPS data in the database and broadcasting updates via WebSockets.

import { PrismaClient, GpsData as PrismaGpsData } from '@prisma/client';

const prisma = new PrismaClient();

// Define a type for incoming GPS data, consistent with ParsedGpsData from gps-auth.service.ts
// and suitable for database storage after timestamp conversion.
interface GpsDataPayload {
  vehicleId: string;
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
 * @returns A promise that resolves to the created GpsData record from Prisma.
 */
export async function storeGPSData(gpsData: GpsDataPayload): Promise<PrismaGpsData> {
  console.log('[GPS Storage] Attempting to store data for vehicle:', gpsData.vehicleId);
  
  try {
    const createdGpsData = await prisma.gpsData.create({
      data: {
        vehicleId: gpsData.vehicleId,
        latitude: gpsData.latitude,
        longitude: gpsData.longitude,
        timestamp: new Date(gpsData.timestamp), // Convert ISO string to Date object for DateTime field
        accuracy: gpsData.accuracy,
        speed: gpsData.speed,
        heading: gpsData.heading,
        altitude: gpsData.altitude,
      }
    });
    console.log('[GPS Storage] Data stored successfully. ID:', createdGpsData.id);
    return createdGpsData;
  } catch (error) {
    console.error('[GPS Storage] Error storing data:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace',
      // Prisma errors often have 'code' and 'meta' properties
      code: (error as any).code || 'N/A',
      meta: (error as any).meta || 'N/A',
    });
    throw new Error(`Failed to store GPS data: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Retrieves GPS data from the database based on optional vehicle ID and limit.
 * Note: Sorting is done in-memory to avoid potential index issues with `orderBy()` on large datasets.
 * @param options - An object containing optional vehicleId and a required limit for results.
 * @returns A promise that resolves to an array of GpsData records.
 */
export async function getGpsData({ vehicleId, limit }: { vehicleId?: string; limit: number }): Promise<PrismaGpsData[]> {
  try {
    const queryOptions: any = {
      take: limit, // Take the specified number of records
      // orderBy is removed as per instructions to avoid potential index issues.
      // Sorting will be done in-memory if needed.
    };

    if (vehicleId) {
      queryOptions.where = { vehicleId: vehicleId };
    }

    const results = await prisma.gpsData.findMany(queryOptions);

    // Sort in-memory if a specific order (e.g., by timestamp) is desired and not handled by DB indexing.
    // For 'desc' timestamp, you would do:
    results.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return results;
  } catch (error) {
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
 * This function assumes a global WebSocket server instance (e.g., `global.wsServer`) is available.
 * You'll need to implement the actual WebSocket server setup and client management.
 * @param gpsData The GPS data payload to broadcast.
 */
export function broadcastGPSUpdate(gpsData: GpsDataPayload): void {
  console.log('[GPS Broadcast] Broadcasting update for vehicle:', gpsData.vehicleId);
  
  // Example WebSocket broadcast (replace with your actual WebSocket server logic):
  // This part needs your WebSocket server instance (e.g., from an app.ts or server.ts file).
  // For instance, if you have a global WebSocket server instance:
  // if (global.wsServer && global.wsServer.clients) {
  //   global.wsServer.clients.forEach((client: any) => { // Cast client to 'any' or define WebSocket type
  //     if (client.readyState === WebSocket.OPEN) {
  //       client.send(JSON.stringify({
  //         type: 'vehicle_moved', // Consistent with your blueprint's event name
  //         payload: {
  //           vehicleId: gpsData.vehicleId,
  //           latitude: gpsData.latitude,
  //           longitude: gpsData.longitude,
  //           speed: gpsData.speed,
  //           timestamp: gpsData.timestamp // Send as ISO string for consistency with client
  //         }
  //       }));
  //     }
  //   });
  // } else {
  //   console.warn('[GPS Broadcast] WebSocket server instance not found or clients not available.');
  // }
}
