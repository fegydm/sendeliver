// File: ./back/src/services/vehicles.services.ts
// Last change: Enhanced debug logging for raw DB values

import { pool } from "../configs/db.js";
import { DELIVERY_CONSTANTS } from "../../../common/dist/constants/vehicle.constants.js";

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
  delivery_date: string;
  delivery_time: string;
  id_pp: number;
}

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
    COALESCE(p.latitude, NULL) AS latitude,
    COALESCE(p.longitude, NULL) AS longitude
FROM deliveries d
LEFT JOIN LATERAL (
    SELECT latitude, longitude
    FROM geo.postal_codes p
    WHERE p.country_code = d.delivery_country 
      AND p.postal_code = d.delivery_zip
    ORDER BY latitude DESC
    LIMIT 1
) p ON TRUE
WHERE 
    (d.delivery_date::timestamp + d.delivery_time::interval) > (NOW() AT TIME ZONE 'UTC' - INTERVAL '${DELIVERY_CONSTANTS.MAX_PAST_TIME_HOURS} hours')
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

      console.log(`🔍 Fetching all vehicles from last ${DELIVERY_CONSTANTS.MAX_PAST_TIME_HOURS} hours`);
      const result = await pool.query(GET_ALL_RECENT_DELIVERIES_QUERY);
      const deliveries = result.rows;
      console.log(`[VehicleService] Query returned ${deliveries.length} raw delivery records`);

      if (deliveries.length === 0) {
        console.warn(`⚠️ No deliveries found in the last ${DELIVERY_CONSTANTS.MAX_PAST_TIME_HOURS} hours`);
        return [];
      }

      const vehicles: Vehicle[] = deliveries.map((delivery: DeliveryRecord) => {
        const datePart = delivery.delivery_date
  ? `${delivery.delivery_date.getFullYear()}-${String(delivery.delivery_date.getMonth() + 1).padStart(2, '0')}-${String(delivery.delivery_date.getDate()).padStart(2, '0')}`
  : new Date().toISOString().split("T")[0];
        const timePart = delivery.delivery_time
          ? String(delivery.delivery_time).padEnd(8, ":00").substring(0, 8)
          : "00:00:00";

        console.log(`[VehicleService] Raw DB - id_pp: ${delivery.id_pp}, delivery_date: ${delivery.delivery_date}, delivery_time: ${delivery.delivery_time}`);
        console.log(`[VehicleService] Processed - id_pp: ${delivery.id_pp}, delivery_date: ${datePart}, delivery_time: ${timePart}`);

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
          delivery_date: datePart,
          delivery_time: timePart,
          id_pp: delivery.id_pp || 0,
        };
      });

      console.log(`[VehicleService] Processed ${vehicles.length} vehicles from last ${DELIVERY_CONSTANTS.MAX_PAST_TIME_HOURS} hours`);
      return vehicles;
    } catch (error) {
      console.error("❌ Failed to fetch vehicles:", error);
      throw error;
    }
  }
}