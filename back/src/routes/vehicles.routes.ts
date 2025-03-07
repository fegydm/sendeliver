// File: .back/src/routes/vehicles.routes.ts
// Last change: Fixed TypeScript errors and improved type safety

import { Router } from "express";
import { VehicleService } from "../services/vehicles.services.js";

const router = Router();
const vehicleService = VehicleService.getInstance();

// Define interfaces for better type safety
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

// Handler pre vyhľadávanie vozidiel
const handleSearchVehicles = async (req: any, res: any): Promise<void> => {
  try {
    // Zaloguj celé telo požiadavky na ladenie
    console.log('🚚 Prijatá požiadavka na vyhľadanie vozidiel:', JSON.stringify(req.body, null, 2));

    // Extrahuj parametre z tela požiadavky (z frontendu)
    const { pickup, delivery, cargo } = req.body as SearchRequestBody;

    // Over, či máme potrebné údaje
    if (!pickup || !pickup.lat || !pickup.lng) {
      console.warn("⚠️ Chýbajú súradnice miesta vyzdvihnutia");
      res.status(400).json({ 
        error: "Chýbajúce súradnice vyzdvihnutia", 
        message: "Miesto vyzdvihnutia musí obsahovať zemepisnú šírku a dĺžku" 
      });
      return;
    }

    // Priprav parametre pre službu
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

    console.log(`🔍 Vyhľadávam vozidlá s parametrami: LAT=${pickup.lat}, LNG=${pickup.lng}`);

    // Načítaj reálne vozidlá z databázy cez VehicleService
    const vehicles = await vehicleService.searchVehicles(searchParams);

    // Zaloguj počet nájdených vozidiel
    console.log(`📊 Nájdených ${vehicles.length} vozidiel`);

    // Vráť odpoveď klientovi
    res.json(vehicles);

  } catch (error: unknown) {
    // Zaloguj a spracuj chyby
    console.error("❌ Vyhľadávanie vozidiel zlyhalo:", error);
    const chybovaSprava = error instanceof Error ? error.message : "Neznáma chyba";
    res.status(500).json({ error: `Nepodarilo sa vyhľadať vozidlá: ${chybovaSprava}` });
  }
};

// Registruj trasu pre vyhľadávanie
router.post("/search", handleSearchVehicles);

export default router;