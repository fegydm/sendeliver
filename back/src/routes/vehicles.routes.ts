
// File: ./back/src/routes/vehicles.routes.ts
// Router for vehicle search API endpoint, updated with centralized constants
import { Router, Request, Response, NextFunction } from 'express';
import { VehicleService } from "../services/vehicles.services.js";
import * as fs from "fs/promises";
import { fileURLToPath } from "url";
import * as path from "path";
import { DELIVERY_CONSTANTS } from "../../../shared/constants/vehicle.constants.js"; // Import centralized constants

const router = Router();
const vehicleService = VehicleService.getInstance();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logFilePath = path.join(__dirname, "vehicle_search_logs.txt");

// Function to append log entries to a file
async function logToFile(message: string) {
  const timestamp = new Date().toISOString();
  const logEntry = `[${timestamp}] ${message}\n`;
  try {
    await fs.appendFile(logFilePath, logEntry);
  } catch (err) {
    console.error("Failed to write to log file:", err);
  }
}

interface CountryInfo {
  cc: string;
  flag: string;
}

interface LocationData {
  country: CountryInfo;
  psc: string;
  city: string;
  time: string;
  lat: number;
  lng: number;
}

interface CargoData {
  pallets: number;
  weight: number;
}

interface SearchRequestBody {
  pickup?: Partial<LocationData>;
  delivery?: Partial<LocationData>;
  cargo?: Partial<CargoData>;
}

// Create a typed request interface
interface TypedRequest<T> extends Request {
  body: T;
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

interface ExtendedVehicle {
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
  availability_date: string;
  availability_time: string;
  id_pp: number;
  distance: number;
}

// Calculate distance between two points using Haversine formula
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Convert degrees to radians
function deg2rad(deg: number): number {
  return deg * (Math.PI / 180);
}

// Filter vehicles based on form criteria (distance, capacity, weight, time)
function filterVehiclesByFormCriteria(vehicles: Vehicle[], params: SearchRequestBody): ExtendedVehicle[] {
  if (!Array.isArray(vehicles)) {
    const errorMessage = "❌ filterVehiclesByFormCriteria: Expected array, got: " + typeof vehicles;
    console.error(errorMessage);
    logToFile(errorMessage);
    return [];
  }

  const withDistances = vehicles.map(vehicle => {
    let distance = 0;
    if (
      params.pickup?.lat !== undefined &&
      params.pickup?.lng !== undefined &&
      vehicle.current_location?.lat !== undefined &&
      vehicle.current_location?.lng !== undefined
    ) {
      distance = calculateDistance(
        params.pickup.lat,
        params.pickup.lng,
        vehicle.current_location.lat,
        vehicle.current_location.lng
      );
    }
    return {
      ...vehicle,
      distance: Math.round(distance),
      availability_date: vehicle.delivery_date,
      availability_time: vehicle.delivery_time,
    } as ExtendedVehicle;
  });

  const withinDistance = withDistances.filter(vehicle => vehicle.distance <= DELIVERY_CONSTANTS.MAX_DISTANCE_KM);

  return withinDistance.filter(vehicle => {
    if (
      params.cargo?.pallets !== undefined &&
      params.cargo.pallets > 0 &&
      vehicle.capacity < params.cargo.pallets
    ) {
      return false;
    }

    if (
      params.cargo?.weight !== undefined &&
      params.cargo.weight > 0 &&
      vehicle.max_weight < params.cargo.weight
    ) {
      return false;
    }

    if (params.pickup?.time && vehicle.availability_date && vehicle.availability_time) {
      const pickupTime = new Date(params.pickup.time);
      const vehicleAvailTime = new Date(`${vehicle.availability_date}T${vehicle.availability_time}Z`);
      if (vehicleAvailTime > pickupTime) return false;
    }

    return true;
  });
}

// Handle vehicle search request
const handleSearchVehicles = async (
  req: TypedRequest<SearchRequestBody>,
  res: Response
): Promise<void> => {
  try {
    console.log("🔍 Received vehicle search request");
    await logToFile(`Received request body: ${JSON.stringify(req.body, null, 2)}`);

    if (!req.body) {
      const errorMsg = "Request body is missing";
      console.error(`❌ ${errorMsg}`);
      await logToFile(`❌ ${errorMsg}`);
      res.status(400).json({ error: errorMsg });
      return;
    }

    const { pickup, delivery, cargo } = req.body as SearchRequestBody;

    if (!pickup) {
      const errorMsg = "Missing pickup data in request";
      console.error(`❌ ${errorMsg}`);
      await logToFile(`❌ ${errorMsg}`);
      res.status(400).json({ error: errorMsg });
      return;
    }

    if (!pickup.lat || !pickup.lng) {
      const warnLog = "⚠️ Missing pickup location coordinates";
      console.warn(warnLog);
      await logToFile(warnLog);
      res.status(400).json({
        error: "Missing pickup coordinates",
        message: "Pickup location must include latitude and longitude",
      });
      return;
    }

    console.log("📋 Search with parameters:", {
      pickup: {
        coords: `${pickup.lat},${pickup.lng}`,
        country: pickup.country?.cc,
        city: pickup.city,
      },
      cargo: cargo,
    });

    const searchParams = {
      pickup: {
        country: pickup.country || { cc: "", flag: "" },
        psc: pickup.psc || "",
        city: pickup.city || "",
        time: pickup.time || new Date().toISOString(),
        lat: pickup.lat,
        lng: pickup.lng,
      },
      delivery: {
        country: delivery?.country || { cc: "", flag: "" },
        psc: delivery?.psc || "",
        city: delivery?.city || "",
        time: delivery?.time || "",
        lat: delivery?.lat || 0,
        lng: delivery?.lng || 0,
      },
      cargo: {
        pallets: cargo?.pallets || 0,
        weight: cargo?.weight || 0,
      },
    };

    console.log(`🔍 Searching vehicles with MAX_DISTANCE=${DELIVERY_CONSTANTS.MAX_DISTANCE_KM}km`);

    try {
      const vehiclesResult = await vehicleService.searchVehicles(searchParams);
      console.log(`✅ Service returned ${vehiclesResult.length} total vehicles`);

      const vehicles: Vehicle[] = Array.isArray(vehiclesResult) ? vehiclesResult : [];

      if (vehicles.length === 0) {
        console.log("⚠️ No vehicles found in the database");
        res.json({
          totalCount: 0,
          filtered: 0,
          vehicles: [],
        });
        return;
      }

      const totalVehiclesCount = vehicles.length;
      const filteredVehicles = filterVehiclesByFormCriteria(vehicles, req.body);
      const vehiclesWithinDistance = vehicles.filter(vehicle => {
        const distance = calculateDistance(
          pickup.lat!,
          pickup.lng!,
          vehicle.current_location.lat,
          vehicle.current_location.lng
        );
        return distance <= DELIVERY_CONSTANTS.MAX_DISTANCE_KM;
      }).length;

      filteredVehicles.sort((a, b) => a.distance - b.distance);

      const summaryLog = `📊 Found ${totalVehiclesCount} total vehicles, ${vehiclesWithinDistance} within ${DELIVERY_CONSTANTS.MAX_DISTANCE_KM}km, ${filteredVehicles.length} after all filters`;
      console.log(summaryLog);
      await logToFile(summaryLog);

      res.json({
        totalCount: totalVehiclesCount,
        withinDistance: vehiclesWithinDistance,
        filtered: filteredVehicles.length,
        vehicles: filteredVehicles,
      });
    } catch (serviceError) {
      const errorMessage = serviceError instanceof Error ? serviceError.message : "Unknown service error";
      const errorLog = `❌ Vehicle service error: ${errorMessage}`;
      console.error(errorLog);
      console.error(serviceError);
      await logToFile(errorLog);
      res.status(500).json({ error: `Vehicle service error: ${errorMessage}` });
    }
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const errorTrace = error instanceof Error && error.stack ? error.stack : "No stack trace";
    const errorLog = `❌ Vehicle search failed: ${errorMessage}`;
    console.error(errorLog);
    console.error(errorTrace);
    await logToFile(`${errorLog}\nStack: ${errorTrace}`);
    res.status(500).json({ error: `Failed to search for vehicles: ${errorMessage}` });
  }
};

router.post("/search", handleSearchVehicles);

export default router;