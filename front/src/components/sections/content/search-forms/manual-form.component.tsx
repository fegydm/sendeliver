// File: ./front/src/components/sections/content/search-forms/manual-form.component.tsx
// Removed DateTimeSelect and set default time values directly
// Removed setTimeout calls in handleLocationSelect for direct validation

import React, { useState, useEffect, useRef, useCallback } from "react";
import CountrySelect from "./CountrySelect";
import PostalCitySelect from "./PostalCitySelect";
import { TransportFormData, LocationType, LocationSuggestion } from "@/types/transport-forms.types";
import { useCountriesContext } from "@/contexts/CountriesContext";
import { useTranslationContext } from "@/contexts/TranslationContext";
import loadIconWebp from "@/assets/icon-load.webp";
import deliverIconWebp from "@/assets/icon-del.webp";
import Button from "@/components/ui/button.ui";
import Input from "@/components/ui/input.ui";
import Label from "@/components/ui/label.ui";
import { SenderResultData } from "@/components/sections/content/results/result-table.component";
import usePrevious from "@/hooks/usePrevious";

const DEFAULT_PICKUP_TIME = new Date(new Date().getTime() + 3 * 60 * 60 * 1000).toISOString();
const DEFAULT_DELIVERY_TIME = new Date(new Date().getTime() + 6 * 60 * 60 * 1000).toISOString();

interface ManualFormProps {
  onSubmit: (data: TransportFormData) => void;
  onVehiclesFound?: (vehicles: SenderResultData[], totalCount: number, loadingDt: string) => void;
  formData?: TransportFormData;
  type: "sender" | "hauler";
  className?: string;
}

const DEFAULT_FORM_DATA: TransportFormData = {
  pickup: { country: { cc: "", flag: "" }, psc: "", city: "", time: DEFAULT_PICKUP_TIME, lat: 0, lng: 0 },
  delivery: { country: { cc: "", flag: "" }, psc: "", city: "", time: DEFAULT_DELIVERY_TIME, lat: 0, lng: 0 },
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
  const { t } = useTranslationContext();
  useCountriesContext();

  const pickupPscRef = useRef<HTMLInputElement>(null);
  const deliveryPscRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  // Store the latest form data in a ref to avoid stale state issues
  const formDataRef = useRef<TransportFormData>(JSON.parse(JSON.stringify(formData)));

  // State for component UI
  const [localFormData, setLocalFormData] = useState<TransportFormData>(formData);
  const [isPickupValid, setIsPickupValid] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  // Fetch postal format for the selected country
  const fetchPostalFormat = useCallback(async (cc: string) => {
    try {
      const response = await fetch(`/api/geo/countries/country_formats?cc=${cc}`);
      if (!response.ok) {
        if (response.status === 404 && isDevMode) {
          console.warn(`[ManualForm] Missing format for ${cc}, using fallback`);
          return;
        }
        throw new Error(`HTTP error: ${response.status}`);
      }
      // Not storing formats in this temporary setup
    } catch (error) {
      console.error(`Error fetching postal format for ${cc}:`, error);
    }
  }, []);

  // Handle country selection: update the corresponding location data and reset other fields
  const handleCountrySelect = useCallback(
    (locationType: LocationType, cc: string, flag: string) => {
      setLocalFormData((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        updated[locationType] = {
          ...updated[locationType],
          country: { cc, flag },
          psc: "",
          city: "",
          lat: 0,
          lng: 0,
          // Keep default time intact
          time: locationType === LocationType.PICKUP ? DEFAULT_PICKUP_TIME : DEFAULT_DELIVERY_TIME,
        };
        formDataRef.current = updated;
        return updated;
      });
      setIsPickupValid(false);
      if (cc.length === 2) fetchPostalFormat(cc);
    },
    [fetchPostalFormat]
  );

  // Focus postal code input after country selection
  const focusPostalCode = useCallback((locationType: LocationType) => {
    if (locationType === LocationType.PICKUP) pickupPscRef.current?.focus();
    else deliveryPscRef.current?.focus();
  }, []);

  // Handle location selection from PostalCitySelect
  const handleLocationSelect = useCallback(
    (locationType: LocationType, location: Omit<LocationSuggestion, "priority">) => {
      console.log(`[ManualForm] Location selected for ${locationType}:`, location);

      // Create a deep copy of the current form data
      const updatedData = JSON.parse(JSON.stringify(localFormData));

      // Update country info if provided
      if (location.cc) {
        const flagUrl = location.flag || `/flags/4x3/optimized/${location.cc.toLowerCase()}.svg`;
        updatedData[locationType].country = { cc: location.cc, flag: flagUrl };
      }

      // Update location fields with provided values
      updatedData[locationType].psc = location.psc || "";
      updatedData[locationType].city = location.city || "";
      updatedData[locationType].lat =
        typeof location.lat === "string" ? parseFloat(location.lat) : (location.lat || 0);
      updatedData[locationType].lng =
        typeof location.lng === "string" ? parseFloat(location.lng) : (location.lng || 0);

      // If no time is set, assign default time
      if (!updatedData[locationType].time) {
        updatedData[locationType].time =
          locationType === LocationType.PICKUP ? DEFAULT_PICKUP_TIME : DEFAULT_DELIVERY_TIME;
        console.log(`[ManualForm] Setting default time for ${locationType}:`, updatedData[locationType].time);
      }

      console.log(`[ManualForm] Updating form data for ${locationType}:`, updatedData[locationType]);

      // Update ref and local state
      formDataRef.current = updatedData;
      setLocalFormData(updatedData);

      // Validate pickup directly
      if (locationType === LocationType.PICKUP) {
        const isValid =
          updatedData.pickup.country.cc !== "" &&
          updatedData.pickup.psc !== "" &&
          updatedData.pickup.city !== "";
        console.log(`[ManualForm] Pickup validation: ${isValid}`, updatedData.pickup);
        setIsPickupValid(isValid);
      }
    },
    [localFormData]
  );

  // Handle cargo data changes
  const handleCargoChange = useCallback((field: "pallets" | "weight", value: number) => {
    setLocalFormData((prev) => {
      const updated = JSON.parse(JSON.stringify(prev));
      updated.cargo[field] = value;
      formDataRef.current = updated;
      return updated;
    });
  }, []);

  // Handle form submission
  const handleManualSubmit = useCallback(
    async (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const submitData = JSON.parse(JSON.stringify(formDataRef.current));

      const isValid =
        submitData.pickup.country.cc !== "" &&
        submitData.pickup.psc !== "" &&
        submitData.pickup.city !== "";

      console.log("[ManualForm] Submit validation:", {
        isValid,
        pickup: submitData.pickup,
      });

      if (!isValid) {
        console.warn("[ManualForm] Pickup data is invalid, cannot submit:", submitData.pickup);
        return;
      }

      setIsSearching(true);

      try {
        if (!submitData.pickup.time) {
          submitData.pickup.time = DEFAULT_PICKUP_TIME;
          console.log("[ManualForm] Adding fallback time:", submitData.pickup.time);
        }

        console.log("[ManualForm] Submitting with data:", submitData);

        const response = await fetch("/api/vehicles/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();
        const loadingDt = submitData.pickup.time;

        const transformedResults = Array.isArray(data.vehicles)
          ? data.vehicles.map((vehicle: any) => {
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
            })
          : [];

        onSubmit(submitData);
        if (onVehiclesFound && transformedResults.length > 0) {
          onVehiclesFound(transformedResults, data.totalCount || 0, loadingDt);
        }
      } catch (error) {
        console.error("[ManualForm] Error during submission:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [onSubmit, onVehiclesFound]
  );

  console.log("[ManualForm] Render state:", {
    isPickupValid,
    isSearching,
    pickupData: formDataRef.current.pickup,
    localFormDataPickup: localFormData.pickup,
    hasValidPickupData:
      localFormData.pickup.country.cc !== "" &&
      localFormData.pickup.psc !== "" &&
      localFormData.pickup.city !== "",
  });

  useEffect(() => {
    console.log("[ManualForm] localFormData changed:", localFormData);
  }, [localFormData]);

  const prevLocalFormData = usePrevious(localFormData);

  useEffect(() => {
    if (prevLocalFormData && JSON.stringify(prevLocalFormData) !== JSON.stringify(localFormData)) {
      console.log("[ManualForm] localFormData changed from:", prevLocalFormData, "to:", localFormData);
    }
  }, [localFormData, prevLocalFormData]);

  return (
    <form
      ref={formRef}
      className={`manual-form manual-form--${type} ${className}`}
      onSubmit={(e) => e.preventDefault()}
    >
      <div className="manual-form__header">
        <h3 className="manual-form__title">{t(type === "sender" ? "m_f_title_sender" : "m_f_title_hauler")}</h3>
        <Label variant="description" className="manual-form__descr">
          {t(type === "sender" ? "m_f_descr_sender" : "m_f_descr_hauler")}
        </Label>
        <Label variant="description" className="manual-form__descr">{t("fields_required")}</Label>
      </div>

      <section className={`manual-form__pickup ${isPickupValid ? "manual-form__pickup--valid" : ""}`}>
        <h3 className="manual-form__sub">{t(type === "sender" ? "m_f_sub_pickup_sender" : "m_f_sub_pickup_hauler")}</h3>
        <div className="manual-form__grid">
          <div className="manual-form__country">
            <Label>{t("m_f_lbl_country")}</Label>
            <CountrySelect
              onCountrySelect={(cc, flag) => handleCountrySelect(LocationType.PICKUP, cc, flag)}
              onNextFieldFocus={() => focusPostalCode(LocationType.PICKUP)}
              initialValue={localFormData.pickup.country.cc}
              locationType={LocationType.PICKUP}
              role={type}
            />
          </div>
          <div className="manual-form__location">
            <Label>{t("m_f_lbl_location")}</Label>
            <PostalCitySelect
              pscRef={pickupPscRef}
              onValidSelection={() => {}}
              onSelectionChange={(location) => handleLocationSelect(LocationType.PICKUP, location)}
              locationType={LocationType.PICKUP}
              cc={localFormData.pickup.country.cc}
              dbPostalCodeMask={""}
              postalCodeRegex={""}
              role={type}
            />
          </div>
          <div className="manual-form__load-img">
            <img src={loadIconWebp} alt="Loading icon" style={{ height: "50px", width: "auto" }} />
          </div>
          <div className="manual-form__datetime">
            <Label>{t("m_f_lbl_loading_dt")}</Label>
            <Input
              type="text"
              value={localFormData.pickup.time}
              readOnly
              role={type}
              className="datetime-default"
            />
          </div>
        </div>
      </section>

      <section className="manual-form__delivery">
        <h3 className="manual-form__sub">{t(type === "sender" ? "m_f_sub_delivery_sender" : "m_f_sub_delivery_hauler")}</h3>
        <div className="manual-form__grid">
          <div className="manual-form__country">
            <Label>{t("m_f_lbl_country")}</Label>
            <CountrySelect
              onCountrySelect={(cc, flag) => handleCountrySelect(LocationType.DELIVERY, cc, flag)}
              onNextFieldFocus={() => focusPostalCode(LocationType.DELIVERY)}
              initialValue={localFormData.delivery.country.cc}
              locationType={LocationType.DELIVERY}
              role={type}
            />
          </div>
          <div className="manual-form__location">
            <Label>{t("m_f_lbl_location")}</Label>
            <PostalCitySelect
              pscRef={deliveryPscRef}
              onValidSelection={() => {}}
              onSelectionChange={(location) => handleLocationSelect(LocationType.DELIVERY, location)}
              locationType={LocationType.DELIVERY}
              cc={localFormData.delivery.country.cc}
              dbPostalCodeMask={""}
              postalCodeRegex={""}
              role={type}
            />
          </div>
          <div className="manual-form__deliver-img">
            <img src={deliverIconWebp} alt="Delivery icon" style={{ height: "45px", width: "auto" }} />
          </div>
          <div className="manual-form__datetime">
            <Label>{t("m_f_lbl_delivery_dt")}</Label>
            <Input
              type="text"
              value={localFormData.delivery.time}
              readOnly
              role={type}
              className="datetime-default"
            />
          </div>
        </div>
      </section>

      <section className="manual-form__cargo">
        <h3 className="manual-form__sub">{t(type === "sender" ? "m_f_sub_cargo_sender" : "m_f_sub_cargo_hauler")}</h3>
        <div className="manual-form__cargo-row">
          <div className="cargo-field">
            <Label>{t("m_f_lbl_pallets")}</Label>
            <Input
              type="number"
              role={type}
              value={localFormData.cargo.pallets}
              onChange={(e) => handleCargoChange("pallets", Number(e.target.value))}
              min="0"
              className="cargo-input"
            />
          </div>
          <div className="cargo-field">
            <Label>{t("m_f_lbl_weight")}</Label>
            <Input
              type="number"
              role={type}
              value={localFormData.cargo.weight}
              onChange={(e) => handleCargoChange("weight", Number(e.target.value))}
              min="0"
              step="0.1"
              className="cargo-input"
            />
          </div>
        </div>
      </section>

      <Button
        type="button"
        variant="primary"
        role={type}
        active={isPickupValid && !isSearching}
        disabled={!isPickupValid || isSearching}
        className={`manual-form__submit ${!isPickupValid ? "manual-form__submit--disabled" : ""}`}
        onClick={handleManualSubmit}
      >
        {isSearching ? t("m_f_btn_searching") : t("m_f_btn_submit")}
      </Button>
    </form>
  );
}

export default ManualForm;