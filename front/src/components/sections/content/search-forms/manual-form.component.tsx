// File: src/components/sections/content/search-forms/manual-form.component.tsx
import React, { useState, useRef, useCallback } from "react";
import CountrySelect from "./CountrySelect";
import PostalCitySelect from "./PostalCitySelect";
import { DateTimeSelect } from "./DateTimeSelect";
import { TransportFormData, LocationType, LocationSuggestion } from "@/types/transport-forms.types";
import { useCountriesContext } from "@/contexts/CountriesContext";
import { useTranslationContext } from "@/contexts/TranslationContext"; // <-- Translation system
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

// Combined function to search vehicles and return the loading date/time as ISO string
async function searchAvailableVehiclesInternal(
  localFormData: TransportFormData,
  setAvailableVehicles: React.Dispatch<React.SetStateAction<SenderResultData[]>>,
  setTotalVehiclesCount: React.Dispatch<React.SetStateAction<number>>
): Promise<string> {
  try {
    const { lat, lng } = localFormData.pickup;
    if (!lat || !lng) {
      const now = new Date();
      return new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();
    }
  
    const now = new Date();
    const loadingDt = localFormData.pickup.time
      ? new Date(localFormData.pickup.time)
      : new Date(now.getTime() + 3 * 60 * 60 * 1000);
  
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
    setTotalVehiclesCount(data.totalCount || 0);
  
    if (!data || !data.vehicles || !Array.isArray(data.vehicles)) {
      setAvailableVehicles([]);
      return loadingDt.toISOString();
    }
  
    const transformedResults: SenderResultData[] = data.vehicles.map((vehicle) => {
      const speedKmPerHour = 80;
      const hours = vehicle.distance / speedKmPerHour;
      const fullHours = Math.floor(hours);
      const minutes = Math.round((hours - fullHours) * 60);
      const transit = fullHours === 0 ? `${minutes}m` : `${fullHours}h ${minutes}m`;
  
      return {
        distance: vehicle.distance,
        type: vehicle.vehicle_type || "Unknown",
        status: "Available",
        availability_date: vehicle.availability_date,
        availability_time: vehicle.availability_time,
        transit,
        rating: Math.round((3.1 + Math.random() * (4.9 - 3.1)) * 10) / 10,
        id_pp: vehicle.id_pp,
        name_carrier: vehicle.carrier_name || "Unknown Carrier",
      };
    });
  
    setAvailableVehicles(transformedResults);
    return loadingDt.toISOString();
  } catch (error) {
    console.error("Error searching vehicles:", error);
    setAvailableVehicles([]);
    const now = new Date();
    return new Date(now.getTime() + 3 * 60 * 60 * 1000).toISOString();
  }
}

export function ManualForm({
  onSubmit,
  onVehiclesFound,
  formData = DEFAULT_FORM_DATA,
  type = "sender",
  className = "",
}: ManualFormProps) {
  const { t } = useTranslationContext();
  const { countries: allCountries } = useCountriesContext();

  const pickupPscRef = useRef<HTMLInputElement>(null);
  const deliveryPscRef = useRef<HTMLInputElement>(null);

  const [localFormData, setLocalFormData] = useState<TransportFormData>(formData);
  const [isPickupValid, setIsPickupValid] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [postalFormats, setPostalFormats] = useState<Record<string, PostalFormat>>({});
  const [availableVehicles, setAvailableVehicles] = useState<SenderResultData[]>([]);
  const [totalVehiclesCount, setTotalVehiclesCount] = useState<number>(0);

  // Fetch postal format for given country code
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

  // Validate pickup data
  const validatePickup = (): boolean => {
    const pickup = localFormData.pickup;
    const isValid = pickup.country.cc !== "" && pickup.psc !== "" && pickup.city !== "";
    setIsPickupValid(isValid);
    return isValid;
  };

  const handleCountrySelect = useCallback(
    (locationType: LocationType, cc: string, flag: string) => {
      setLocalFormData((prev) => ({
        ...prev,
        [locationType]: { ...prev[locationType], country: { cc, flag }, psc: "", city: "" },
      }));
      if (cc.length === 2) fetchPostalFormat(cc);
    },
    [fetchPostalFormat]
  );

  const focusPostalCode = useCallback((locationType: LocationType) => {
    if (locationType === LocationType.PICKUP) {
      pickupPscRef.current?.focus();
    } else {
      deliveryPscRef.current?.focus();
    }
  }, []);

  const handleLocationSelect = useCallback(
    (locationType: LocationType, location: Omit<LocationSuggestion, "priority">) => {
      const updatedData = { ...localFormData };
      if (location.cc) {
        const flagUrl = `/flags/4x3/optimized/${location.cc.toLowerCase()}.svg`;
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

  // Combined submit handler: validate, search vehicles and then submit the form data.
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePickup()) {
      console.warn("Pickup data is invalid, cannot submit");
      return;
    }
    setIsSearching(true);
    try {
      const loadingDt = await searchAvailableVehiclesInternal(localFormData, setAvailableVehicles, setTotalVehiclesCount);
      const updatedFormData = {
        ...localFormData,
        pickup: { ...localFormData.pickup, time: loadingDt }
      };
      onSubmit(updatedFormData);
      if (onVehiclesFound && availableVehicles.length > 0) {
        onVehiclesFound(availableVehicles, totalVehiclesCount, loadingDt);
      }
    } catch (error) {
      console.error("Error during submission:", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <form className={`manual-form manual-form--${type} ${className}`} onSubmit={handleSubmit}>
      {/* Header using translation keys */}
      <div className="manual-form__header">
        <h2 className="manual-form__title">
          {t(type === "sender" ? "m_f_title_sender" : "m_f_title_hauler")}
        </h2>
        <p className="manual-form__descr">
          {t(type === "sender" ? "m_f_descr_sender" : "m_f_descr_hauler")}
        </p>
      </div>
      
      {/* Pickup Section */}
      <section className={`manual-form__pickup ${isPickupValid ? "manual-form__pickup--valid" : ""}`}>
        <h3 className="manual-form__sub">
          {t(type === "sender" ? "m_f_sub_pickup_sender" : "m_f_sub_pickup_hauler")}
        </h3>
        <div className="manual-form__grid">
          <div className="manual-form__country">
            <label className="manual-form__label">{t("m_f_lbl_country")}</label>
            <CountrySelect
              onCountrySelect={(cc, flag) => handleCountrySelect(LocationType.PICKUP, cc, flag)}
              onNextFieldFocus={() => focusPostalCode(LocationType.PICKUP)}
              initialValue={localFormData.pickup.country.cc}
              locationType={LocationType.PICKUP}
            />
          </div>
          <div className="manual-form__location">
            <label className="manual-form__label">{t("m_f_lbl_location")}</label>
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
            <label className="manual-form__label">{t("m_f_lbl_loading_dt")}</label>
            <DateTimeSelect
              value={localFormData.pickup.time ? new Date(localFormData.pickup.time) : new Date()}
              onChange={(date: Date) => handleDateTimeChange(LocationType.PICKUP, date)}
              min={new Date()}
              locationType="pickup"
            />
          </div>
        </div>
      </section>
      
      {/* Delivery Section */}
      <section className="manual-form__delivery">
        <h3 className="manual-form__sub">
          {t(type === "sender" ? "m_f_sub_delivery_sender" : "m_f_sub_delivery_hauler")}
        </h3>
        <div className="manual-form__grid">
          <div className="manual-form__country">
            <label className="manual-form__label">{t("m_f_lbl_country")}</label>
            <CountrySelect
              onCountrySelect={(cc, flag) => handleCountrySelect(LocationType.DELIVERY, cc, flag)}
              onNextFieldFocus={() => focusPostalCode(LocationType.DELIVERY)}
              initialValue={localFormData.delivery.country.cc}
              locationType={LocationType.DELIVERY}
            />
          </div>
          <div className="manual-form__location">
            <label className="manual-form__label">{t("m_f_lbl_location")}</label>
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
            <label className="manual-form__label">{t("m_f_lbl_delivery_dt")}</label>
            <DateTimeSelect
              value={localFormData.delivery.time ? new Date(localFormData.delivery.time) : null}
              onChange={(date: Date) => handleDateTimeChange(LocationType.DELIVERY, date)}
              min={new Date()}
              locationType="delivery"
            />
          </div>
        </div>
      </section>
      
      {/* Cargo Section */}
      <section className="manual-form__cargo">
        <h3 className="manual-form__sub">
          {t(type === "sender" ? "m_f_sub_cargo_sender" : "m_f_sub_cargo_hauler")}
        </h3>
        <div className="manual-form__cargo-inputs">
          <div className="manual-form__field">
            <label className="manual-form__label">{t("m_f_lbl_pallets")}</label>
            <input
              type="number"
              value={localFormData.cargo.pallets}
              onChange={(e) => handleCargoChange("pallets", Number(e.target.value))}
              min="0"
              className="manual-form__input-number"
            />
          </div>
          <div className="manual-form__field">
            <label className="manual-form__label">{t("m_f_lbl_weight")}</label>
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
        {isSearching ? t("m_f_btn_submit") : t("m_f_btn_submit")}
      </button>
    </form>
  );
}

export default ManualForm;
