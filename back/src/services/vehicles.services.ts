// File: src/services/vehicles.services.ts
// Last change: Return separate date and time fields for frontend compatibility

import { pool } from "../configs/db.js";

interface VehicleSearchParams {
  pickup: {
    country: { cc: string; flag: string };
    psc: string;
    city: string;
    time: string;
    lat?: number;
    lng?: number;
  };
  delivery: {
    country: { cc: string; flag: string };
    psc: string;
    city: string;
    time: string;
    lat?: number;
    lng?: number;
  };
  cargo: {
    pallets: number;
    weight: number;
  };
}

// Updated Vehicle interface to separate date and time
interface Vehicle {
  id: string;
  vehicle_type: string;
  registration_number: string;
  carrier_id: string;
  carrier_name: string;
  capacity: number;
  max_weight: number;
  current_location: {
    lat: number;
    lng: number;
    country_code: string;
    city: string;
  };
  delivery_date: string; // e.g., "2025-03-11"
  delivery_time: string; // e.g., "14:00:00"
  id_pp: number;
}

// Define interface for delivery record from database (unchanged)
interface DeliveryRecord {
  id: number;
  delivery_id?: string;
  delivery_date?: Date;
  delivery_time?: string;
  delivery_type?: string;
  delivery_country?: string;
  delivery_zip?: string;
  delivery_city?: string;
  weight?: number;
  id_pp?: number;
  id_carrier?: number;
  name_carrier?: string;
  vehicle_type?: string;
  latitude?: number;
  longitude?: number;
}

// Query remains unchanged
export const GET_ALL_RECENT_DELIVERIES_QUERY = `
SELECT DISTINCT ON (d.id)
    d.id,
    d.vehicle_type,
    d.delivery_id,
    d.delivery_date,
    d.delivery_time,
    d.delivery_country,
    d.delivery_city,
    d.weight,
    d.id_pp,
    d.id_carrier,
    d.name_carrier,
    p.latitude,
    p.longitude
FROM 
    deliveries d
INNER JOIN 
    geo.postal_codes p 
    ON d.delivery_country = p.country_code 
    AND d.delivery_zip = p.postal_code
WHERE 
    d.delivery_date >= NOW() - INTERVAL '40 hours'
    AND (d.delivery_date > NOW() - INTERVAL '40 hours' OR d.delivery_time::time >= NOW()::time)
ORDER BY 
    d.id, d.delivery_date DESC, d.delivery_time DESC;
`;

export class VehicleService {
  private static instance: VehicleService;
  private isHealthy = true;

  private constructor() {
    console.log("🔧 VehicleService instance created");
    this.checkHealth().catch((err) => console.error("Initial health check failed:", err));
  }

  public static getInstance(): VehicleService {
    if (!VehicleService.instance) {
      console.log("➕ Creating new VehicleService instance");
      VehicleService.instance = new VehicleService();
    }
    return VehicleService.instance;
  }

  private async checkHealth(): Promise<void> {
    console.log("🔍 Starting database health check for vehicle service");
    try {
      const result = await pool.query("SELECT 1");
      this.isHealthy = true;
      console.log("✅ Vehicle service database health check passed:", result.rows);
    } catch (error) {
      this.isHealthy = false;
      console.error("❌ Vehicle service database health check failed:", error);
      throw error;
    }
  }

  public async searchVehicles(params: VehicleSearchParams): Promise<Vehicle[]> {
    try {
      if (!this.isHealthy) {
        await this.checkHealth();
      }

      console.log("🔍 Fetching all vehicles from last 40 hours");
      const result = await pool.query(GET_ALL_RECENT_DELIVERIES_QUERY);
      const deliveries = result.rows;
      console.log(`📊 Query returned ${deliveries.length} raw delivery records`);

      if (deliveries.length === 0) {
        console.warn("⚠️ No deliveries found in the last 40 hours");
        return [];
      }

      const vehicles: Vehicle[] = deliveries.map((delivery: DeliveryRecord) => {
        // Format date as YYYY-MM-DD
        const datePart = delivery.delivery_date
          ? delivery.delivery_date.toISOString().split("T")[0] // Convert Date to "YYYY-MM-DD"
          : new Date().toISOString().split("T")[0]; // Fallback to today

        // Ensure time is in HH:MM:SS format, trim if necessary
        const timePart = delivery.delivery_time
          ? String(delivery.delivery_time).padEnd(8, ":00").substring(0, 8) // Ensure HH:MM:SS
          : "00:00:00"; // Fallback if null

        return {
          id: delivery.id.toString(),
          vehicle_type: delivery.vehicle_type || "UNKNOWN",
          registration_number: delivery.delivery_id || "N/A",
          carrier_id: delivery.id_carrier?.toString() || "N/A",
          carrier_name: delivery.name_carrier || "Unknown Carrier",
          capacity: delivery.id_pp || 0,
          max_weight: delivery.weight || 0,
          current_location: {
            lat: delivery.latitude || 0,
            lng: delivery.longitude || 0,
            country_code: delivery.delivery_country || "N/A",
            city: delivery.delivery_city || "N/A",
          },
          delivery_date: datePart, // Separate date field
          delivery_time: timePart, // Separate time field
          id_pp: delivery.id_pp || 0,
        };
      });

      console.log(`[VehicleService] Processed ${vehicles.length} vehicles from last 40 hours`);
      return vehicles;
    } catch (error) {
      console.error("❌ Failed to fetch vehicles:", error);
      throw error;
    }
  }
}