// File: .back/src/services/vehicles.services.ts
// Last change: Added explicit type for delivery parameter in map function

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
  delivery_time: string;
  id_pp: number;
}

// Define interface for delivery record from database
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

// Query to fetch vehicle records from yesterday with coordinates
export const GET_RECENT_DELIVERIES_WITH_COORDINATES_QUERY = `
SELECT DISTINCT ON (d.id)
    d.id,
    d.delivery_id,
    d.delivery_date,
    d.delivery_time,
    d.delivery_type,
    d.delivery_country,
    d.delivery_zip,
    d.delivery_city,
    d.weight,
    d.id_pp,
    d.id_carrier,
    d.name_carrier,
    d.vehicle_type,
    p.latitude,
    p.longitude
FROM 
    deliveries d
INNER JOIN 
    geo.postal_codes p 
    ON d.delivery_country = p.country_code 
    AND d.delivery_zip = p.postal_code
WHERE 
    d.delivery_date >= CURRENT_DATE - 1
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

  // Check database connection health
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

  // Fetch vehicles from yesterday from the database
  public async searchVehicles(params: VehicleSearchParams): Promise<Vehicle[]> {
    try {
      if (!this.isHealthy) {
        await this.checkHealth();
      }

      console.log("🔍 Fetching vehicles from yesterday from database");

      const result = await pool.query(GET_RECENT_DELIVERIES_WITH_COORDINATES_QUERY);
      const deliveries = result.rows;

      const vehicles: Vehicle[] = deliveries.map((delivery: DeliveryRecord) => {
        // Format date and time correctly into ISO string (YYYY-MM-DDTHH:MM:SSZ)
        const datePart = delivery.delivery_date
          ? String(delivery.delivery_date).trim() // Ensure no extra spaces
          : new Date().toISOString().split("T")[0]; // Fallback to today
        const timePart = delivery.delivery_time
          ? String(delivery.delivery_time).padEnd(8, ":00").substring(0, 8) // Ensure HH:MM:SS
          : "00:00:00"; // Fallback if null
        const deliveryTime = `${datePart}T${timePart}Z`;

        // Validate the constructed delivery_time
        const parsedDate = new Date(deliveryTime);
        if (isNaN(parsedDate.getTime())) {
          console.error(
            `[VehicleService] Invalid delivery_time constructed: ${deliveryTime}, date: ${datePart}, time: ${timePart}`
          );
        }

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
          delivery_time: deliveryTime,
          id_pp: delivery.id_pp || 0,
        };
      });

      console.log(`[VehicleService] Found ${vehicles.length} vehicles from yesterday:`, JSON.stringify(vehicles, null, 2));
      return vehicles; // Return records from yesterday, filtering < 500 km happens in frontend
    } catch (error) {
      console.error("❌ Failed to fetch vehicles:", error);
      throw error;
    }
  }
}