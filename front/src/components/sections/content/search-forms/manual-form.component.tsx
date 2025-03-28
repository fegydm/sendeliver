// File: .front/src/components/sections/content/search-forms/manual-form.component.tsx
// Last change: Removed ResultTable rendering and added callback for found vehicles

import React, { useState, useRef, useCallback, useEffect } from "react";
import CountrySelect from "./CountrySelect";
import PostalCitySelect from "./PostalCitySelect";
import { DateTimeSelect } from "./DateTimeSelect";
import { TransportFormData, LocationType, LocationSuggestion } from "@/types/transport-forms.types";
import { useCountriesPreload } from "@/hooks/useCountriesPreload";
import loadIconWebp from "@/assets/icon-load.webp"; 
import deliverIconWebp from "@/assets/icon-del.webp"; 
import { SenderResultData } from "@/components/sections/content/results/result-table.component";

interface ManualFormProps {
  onSubmit: (data: TransportFormData) => void;
  onVehiclesFound?: (vehicles: SenderResultData[], totalCount: number, loadingDt: string) => void;
  formData?: TransportFormData;
  type: "sender" | "hauler";
  className?: string;
}

interface PostalFormat {
  format: string;
  regex: string;
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
  availability_date: string;
  availability_time: string;
  id_pp: number;
  distance: number;
}

interface VehicleSearchResponse {
  totalCount: number;
  withinDistance: number;
  filtered: number;
  vehicles: Vehicle[];
}

const DEFAULT_FORM_DATA: TransportFormData = {
  pickup: { country: { cc: "", flag: "" }, psc: "", city: "", time: "", lat: 0, lng: 0 },
  delivery: { country: { cc: "", flag: "" }, psc: "", city: "", time: "", lat: 0, lng: 0 },
  cargo: { pallets: 0, weight: 0 },
};

const isDevMode = process.env.NODE_ENV === "development";

export function ManualForm({
  onSubmit,
  onVehiclesFound,
  formData = DEFAULT_FORM_DATA,
  type = "sender",
  className = "",
}: ManualFormProps) {
  const pickupPscRef = useRef<HTMLInputElement>(null);
  const deliveryPscRef = useRef<HTMLInputElement>(null);

  const [localFormData, setLocalFormData] = useState<TransportFormData>(formData);
  const [isPickupValid, setIsPickupValid] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [postalFormats, setPostalFormats] = useState<Record<string, PostalFormat>>({});
  const [availableVehicles, setAvailableVehicles] = useState<SenderResultData[]>([]);
  const [totalVehiclesCount, setTotalVehiclesCount] = useState<number>(0);
  const { countries: allCountries } = useCountriesPreload();

  const fetchPostalFormat = useCallback(async (cc: string) => {
    try {
      const response = await fetch(`/api/geo/country_formats?cc=${cc}`);
      if (!response.ok) {
        if (response.status === 404 && isDevMode) {
          console.warn(`[ManualForm] Missing format for ${cc}, using fallback`);
          setPostalFormats((prev) => ({
            ...prev,
            [cc]: { format: "#####", regex: "^[0-9]{5}$" },
          }));
          return;
        }
        throw new Error(`HTTP error: ${response.status}`);
      }
      const data = await response.json();
      setPostalFormats((prev) => ({
        ...prev,
        [cc]: { format: data.postal_code_format, regex: data.postal_code_regex },
      }));
    } catch (error) {
      console.error(`Error fetching postal format for ${cc}:`, error);
    }
  }, []);

  useEffect(() => {
    if (!isDevMode) return;
    const countryCount = allCountries.length;
    const formatCount = Object.keys(postalFormats).length;
    if (formatCount > 0 && formatCount < countryCount) {
      console.warn(
        `[ManualForm] Format mismatch: ${formatCount} postal formats vs ${countryCount} countries`
      );
    }
  }, [allCountries, postalFormats]);

  const validatePickup = useCallback(() => {
    const pickup = localFormData.pickup;
    const isValid =
      pickup.country.cc !== "" &&
      pickup.psc !== "" &&
      pickup.city !== "";
    console.log("[ManualForm] Validating pickup:", { pickup, isValid });
    setIsPickupValid(isValid);
    return isValid;
  }, [localFormData.pickup]);

  const calculateTransitTime = (distance: number): string => {
    if (isNaN(distance)) return "Unknown";
    const speedKmPerHour = 80;
    const hours = distance / speedKmPerHour;
    const fullHours = Math.floor(hours);
    const minutes = Math.round((hours - fullHours) * 60);
    return fullHours === 0 ? `${minutes}m` : `${fullHours}h ${minutes}m`;
  };

  const generateRandomRating = (): number => {
    return Math.round((3.1 + Math.random() * (4.9 - 3.1)) * 10) / 10;
  };

  const searchAvailableVehicles = useCallback(async (): Promise<string> => {
    try {
      setIsSearching(true);
  
      const { lat, lng } = localFormData.pickup;
      if (!lat || !lng) {
        console.error("[ManualForm] Missing pickup coordinates");
        const now = new Date();
        return new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(); // Fallback return
      }
  
      const now = new Date();
      const loadingDt = localFormData.pickup.time
        ? new Date(localFormData.pickup.time)
        : new Date(now.getTime() + 3 * 60 * 60 * 1000); // Fallback: now + 3 hours
  
      console.log(`[ManualForm] Searching vehicles with pickup: LAT=${lat}, LNG=${lng}, loading_dt=${loadingDt.toISOString()}`);
  
      const response = await fetch("/api/vehicles/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pickup: localFormData.pickup,
          delivery: localFormData.delivery,
          cargo: localFormData.cargo,
        }),
      });
  
      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }
  
      const data: VehicleSearchResponse = await response.json();
      console.log("[ManualForm] API response:", data);
  
      setTotalVehiclesCount(data.totalCount || 0);
  
      if (!data || !data.vehicles || !Array.isArray(data.vehicles)) {
        console.error("[ManualForm] Invalid API response format:", data);
        setAvailableVehicles([]);
        return loadingDt.toISOString(); // Return loadingDt even on invalid response
      }
  
      console.log("[ManualForm] Raw vehicles data:", JSON.stringify(data.vehicles, null, 2));
  
      const transformedResults: SenderResultData[] = data.vehicles.map((vehicle) => {
        return {
          distance: vehicle.distance,
          type: vehicle.vehicle_type || "Unknown",
          status: "Available",
          availability_date: vehicle.availability_date,
          availability_time: vehicle.availability_time,
          transit: calculateTransitTime(vehicle.distance),
          rating: generateRandomRating(),
          id_pp: vehicle.id_pp,
          name_carrier: vehicle.carrier_name || "Unknown Carrier",
        };
      });
  
      console.log("[ManualForm] Transformed vehicles:", transformedResults);
      setAvailableVehicles(transformedResults);
  
      return loadingDt.toISOString(); // Successful return
    } catch (error) {
      console.error("Error searching vehicles:", error);
      setAvailableVehicles([]);
      const now = new Date();
      return new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString(); // Fallback return on error
    } finally {
      setIsSearching(false);
    }
  }, [localFormData]);

  useEffect(() => {
    validatePickup();
  }, [localFormData.pickup, validatePickup]);

  const handleCountrySelect = useCallback(
    (locationType: LocationType, cc: string, flag: string) => {
      console.log(`[ManualForm] Country selected for ${locationType}:`, cc, flag);
      setLocalFormData((prev) => ({
        ...prev,
        [locationType]: { ...prev[locationType], country: { cc, flag }, psc: "", city: "" },
      }));
      if (cc.length === 2) fetchPostalFormat(cc);
    },
    [fetchPostalFormat]
  );

  const focusPostalCode = useCallback((locationType: LocationType) => {
    (locationType === LocationType.PICKUP ? pickupPscRef : deliveryPscRef).current?.focus();
  }, []);

  const handleLocationSelect = useCallback(
    (locationType: LocationType, location: Omit<LocationSuggestion, "priority">) => {
      console.log(`[ManualForm] Location selected for ${locationType}:`, location);
      const updatedData = { ...localFormData };
      if (location.cc) {
        const flagUrl = location.cc ? `/flags/4x3/optimized/${location.cc.toLowerCase()}.svg` : "";
        updatedData[locationType].country = { cc: location.cc, flag: flagUrl };
      }
      updatedData[locationType].psc = location.psc || "";
      updatedData[locationType].city = location.city || "";
      updatedData[locationType].lat = location.lat ?? 0;
      updatedData[locationType].lng = location.lng ?? 0;
      setLocalFormData(updatedData);
    },
    [localFormData]
  );

  const handleDateTimeChange = useCallback((locationType: LocationType, date: Date) => {
    setLocalFormData((prev) => ({
      ...prev,
      [locationType]: { ...prev[locationType], time: date.toISOString() },
    }));
  }, []);

  const handleCargoChange = useCallback((field: "pallets" | "weight", value: number) => {
    setLocalFormData((prev) => ({
      ...prev,
      cargo: { ...prev.cargo, [field]: value },
    }));
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      console.log("Submitting form data:", localFormData);

      if (validatePickup()) {
        const loadingDt = await searchAvailableVehicles();
        if (loadingDt) {
          // Submit form data
          onSubmit({
            ...localFormData,
            pickup: { ...localFormData.pickup, time: loadingDt }
          });
          
          // Notify parent about found vehicles
          if (onVehiclesFound && availableVehicles.length > 0) {
            onVehiclesFound(availableVehicles, totalVehiclesCount, loadingDt);
          }
        }
      } else {
        console.warn("Pickup data is invalid, cannot submit");
      }
    },
    [localFormData, validatePickup, searchAvailableVehicles, onSubmit, onVehiclesFound, availableVehicles, totalVehiclesCount]
  );

  return (
    <form className={`manual-form manual-form--${type} ${className}`} onSubmit={handleSubmit}>
      <section className={`manual-form__pickup ${isPickupValid ? "manual-form__pickup--valid" : ""}`}>
        <h3 className="manual-form__title">Pickup Details</h3>
        <div className="manual-form__grid">
          <div className="manual-form__country">
            <label className="manual-form__label">Country</label>
            <CountrySelect
              onCountrySelect={(cc, flag) => handleCountrySelect(LocationType.PICKUP, cc, flag)}
              onNextFieldFocus={() => focusPostalCode(LocationType.PICKUP)}
              initialValue={localFormData.pickup.country.cc}
              locationType={LocationType.PICKUP}
            />
          </div>
          <div className="manual-form__location">
            <label className="manual-form__label">Location</label>
            <PostalCitySelect
              pscRef={pickupPscRef}
              onValidSelection={() => {}}
              onSelectionChange={(location) => handleLocationSelect(LocationType.PICKUP, location)}
              locationType={LocationType.PICKUP}
              cc={localFormData.pickup.country.cc}
              dbPostalCodeMask={postalFormats[localFormData.pickup.country.cc]?.format || ""}
              postalCodeRegex={postalFormats[localFormData.pickup.country.cc]?.regex}
            />
          </div>
          <div className="manual-form__load-img">
            <img 
              src={loadIconWebp} 
              alt="Loading icon" 
              style={{ height: "50px", width: "auto" }} 
            />
          </div>
          <div className="manual-form__datetime">
            <label className="manual-form__label">Loading Date/Time</label>
            <DateTimeSelect
              value={localFormData.pickup.time ? new Date(localFormData.pickup.time) : new Date()}
              onChange={(date: Date) => handleDateTimeChange(LocationType.PICKUP, date)}
              min={new Date()}
              locationType="pickup"
            />
          </div>
        </div>
      </section>

      <section className="manual-form__delivery">
        <h3 className="manual-form__title">Delivery Details</h3>
        <div className="manual-form__grid">
          <div className="manual-form__country">
            <label className="manual-form__label">Country</label>
            <CountrySelect
              onCountrySelect={(cc, flag) => handleCountrySelect(LocationType.DELIVERY, cc, flag)}
              onNextFieldFocus={() => focusPostalCode(LocationType.DELIVERY)}
              initialValue={localFormData.delivery.country.cc}
              locationType={LocationType.DELIVERY}
            />
          </div>
          <div className="manual-form__location">
            <label className="manual-form__label">Location</label>
            <PostalCitySelect
              pscRef={deliveryPscRef}
              onValidSelection={() => {}}
              onSelectionChange={(location) => handleLocationSelect(LocationType.DELIVERY, location)}
              locationType={LocationType.DELIVERY}
              cc={localFormData.delivery.country.cc}
              dbPostalCodeMask={postalFormats[localFormData.delivery.country.cc]?.format || ""}
              postalCodeRegex={postalFormats[localFormData.delivery.country.cc]?.regex}
            />
          </div>
          <div className="manual-form__deliver-img">
            <img 
              src={deliverIconWebp} 
              alt="Delivery icon" 
              style={{ height: "45px", width: "auto" }} 
            />
          </div>
          <div className="manual-form__datetime">
            <label className="manual-form__label">Delivery Date/Time</label>
            <DateTimeSelect
              value={localFormData.delivery.time ? new Date(localFormData.delivery.time) : null}
              onChange={(date: Date) => handleDateTimeChange(LocationType.DELIVERY, date)}
              min={new Date()}
              locationType="delivery"
            />
          </div>
        </div>
      </section>

      <section className="manual-form__cargo">
        <h3 className="manual-form__title">Cargo Details</h3>
        <div className="manual-form__cargo-inputs">
          <div className="manual-form__field">
            <label className="manual-form__label">Number of Pallets</label>
            <input
              type="number"
              value={localFormData.cargo.pallets}
              onChange={(e) => handleCargoChange("pallets", Number(e.target.value))}
              min="0"
              className="manual-form__input-number"
            />
          </div>
          <div className="manual-form__field">
            <label className="manual-form__label">Total Weight (kg)</label>
            <input
              type="number"
              value={localFormData.cargo.weight}
              onChange={(e) => handleCargoChange("weight", Number(e.target.value))}
              min="0"
              step="0.1"
              className="manual-form__input-number"
            />
          </div>
        </div>
      </section>

      <button
        type="submit"
        className={`manual-form__submit ${!isPickupValid ? "manual-form__submit--disabled" : ""}`}
        disabled={!isPickupValid || isSearching}
      >
        {isSearching ? "Searching vehicles..." : "Confirm Transport Request"}
      </button>
    </form>
  );
}

export default ManualForm;