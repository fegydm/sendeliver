// File: src/components/sections/content/search-forms/manual-form.component.tsx
// Description: Manual form component for transport request submission, fetching real vehicle data from the backend

import React, { useState, useRef, useCallback, useEffect } from "react";
import CountrySelect from "./CountrySelect";
import PostalCitySelect from "./PostalCitySelect";
import { DateTimeSelect } from "./DateTimeSelect";
import { TransportFormData, LocationType, LocationSuggestion } from "@/types/transport-forms.types";
import { useCountries } from "@/hooks/useCountries";
import loadIcon from "@/assets/load-icon.svg";
import deliverIcon from "@/assets/deliver-icon.svg";
import ResultTable, { SenderResultData } from "@/components/sections/content/results/result-table.component";

interface ManualFormProps {
  onSubmit: (data: TransportFormData) => void;
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
  delivery_time: string;
  id_pp: number;
}

const DEFAULT_FORM_DATA: TransportFormData = {
  pickup: { country: { cc: "", flag: "" }, psc: "", city: "", time: new Date().toISOString(), lat: 0, lng: 0 },
  delivery: { country: { cc: "", flag: "" }, psc: "", city: "", time: "", lat: 0, lng: 0 },
  cargo: { pallets: 0, weight: 0 },
};

const isDevMode = process.env.NODE_ENV === "development";

export function ManualForm({
  onSubmit,
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
  const { items: allCountries } = useCountries();

  // Fetch postal code format for a given country code
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

  // Warn about postal format mismatch in development mode
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

  // Validate pickup data
  const validatePickup = useCallback(() => {
    const pickup = localFormData.pickup;
    const isValid =
      pickup.country.cc !== "" &&
      pickup.psc !== "" &&
      pickup.city !== "" &&
      pickup.time !== "" &&
      pickup.lat !== 0 &&
      pickup.lng !== 0;
    console.log("[ManualForm] Validating pickup:", { pickup, isValid });
    setIsPickupValid(isValid);
    return isValid;
  }, [localFormData.pickup]);

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  };

  // Calculate estimated time of arrival (ETA)
  const calculateETA = (distance: number, deliveryTime: string, pickupTime: string): string => {
    const speedKmPerHour = 80; // Assumed speed in km/h
    const travelTimeHours = distance / speedKmPerHour;
    const travelTimeMs = travelTimeHours * 60 * 60 * 1000;

    // Use deliveryTime if valid, otherwise fall back to pickupTime
    const baseTime = deliveryTime && !isNaN(new Date(deliveryTime).getTime()) ? deliveryTime : pickupTime;
    const baseDateTime = new Date(baseTime);
    if (isNaN(baseDateTime.getTime())) {
      console.warn(`[ManualForm] Invalid base time: ${baseTime}, using current time as fallback`);
      baseDateTime.setTime(Date.now());
    }

    const etaMs = Math.max(baseDateTime.getTime(), Date.now()) + travelTimeMs;
    return new Date(etaMs).toISOString();
  };

  // Generate a random rating between 3.1 and 4.9
  const generateRandomRating = (): number => {
    return Math.round((3.1 + Math.random() * (4.9 - 3.1)) * 10) / 10;
  };

  // Search for available vehicles from the backend
  const searchAvailableVehicles = useCallback(async () => {
    try {
      setIsSearching(true);

      const { lat, lng, time } = localFormData.pickup;
      if (!lat || !lng || !time) {
        console.error("[ManualForm] Missing pickup coordinates or time");
        return;
      }

      console.log(`[ManualForm] Searching vehicles with pickup: LAT=${lat}, LNG=${lng}, TIME=${time}`);

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

      const vehicles: Vehicle[] = await response.json();
      console.log("[ManualForm] Raw vehicles data:", JSON.stringify(vehicles, null, 2));

      const transformedResults: SenderResultData[] = vehicles.map((vehicle) => {
        const distance = calculateDistance(lat, lng, vehicle.current_location.lat, vehicle.current_location.lng);
        const eta = calculateETA(distance, vehicle.delivery_time, time);

        return {
          distance: `${distance} km`,
          vehicleType: vehicle.vehicle_type || "Unknown",
          availabilityTime: vehicle.delivery_time || "Not available",
          eta,
          pp: vehicle.id_pp || 0,
          rating: generateRandomRating(),
        };
      });

      const sortedResults = transformedResults.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
      setAvailableVehicles(sortedResults);
    } catch (error) {
      console.error("Error searching vehicles:", error);
      setAvailableVehicles([]);
    } finally {
      setIsSearching(false);
    }
  }, [localFormData]);

  // Validate pickup data on change
  useEffect(() => {
    validatePickup();
  }, [localFormData.pickup, validatePickup]);

  // Handle country selection
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

  // Focus postal code input based on location type
  const focusPostalCode = useCallback((locationType: LocationType) => {
    (locationType === LocationType.PICKUP ? pickupPscRef : deliveryPscRef).current?.focus();
  }, []);

  // Handle location selection
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

  // Handle date and time change
  const handleDateTimeChange = useCallback((locationType: LocationType, date: Date) => {
    setLocalFormData((prev) => ({
      ...prev,
      [locationType]: { ...prev[locationType], time: date.toISOString() },
    }));
  }, []);

  // Handle cargo field changes
  const handleCargoChange = useCallback((field: "pallets" | "weight", value: number) => {
    setLocalFormData((prev) => ({
      ...prev,
      cargo: { ...prev.cargo, [field]: value },
    }));
  }, []);

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      console.log("Submitting form data:", localFormData);

      if (validatePickup()) {
        await searchAvailableVehicles();
        onSubmit(localFormData);
      } else {
        console.warn("Pickup data is invalid, cannot submit");
      }
    },
    [localFormData, validatePickup, searchAvailableVehicles, onSubmit]
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
            <img src={loadIcon} alt="Loading icon" />
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
            <img src={deliverIcon} alt="Delivery icon" />
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

      {availableVehicles.length > 0 && (
        <section className="manual-form__results">
          <h3 className="manual-form__title">Available Vehicles</h3>
          <ResultTable type={type} data={availableVehicles} />
        </section>
      )}
    </form>
  );
}

export default ManualForm;