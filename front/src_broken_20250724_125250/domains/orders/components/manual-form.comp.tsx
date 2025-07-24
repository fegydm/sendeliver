// File: src/domains/orders/components/manual-form.comp.tsx
// Removed DateTimeSelect and set default time values directly
// Removed setTimeout calls in handleLocationSelect for direct validation

import React, { useState, useEffect, useRef, useCallback } from "react";
import countryselect from "./countryselect";
import postalcityselect from "./postalcityselect";
import { TransportFormData, LocationType, LocationSuggestion } from "@/types/transport-forms.types";
import { useCountriesContext } from "@shared/contexts/countries.context";
import { useTranslationContext } from "@shared/contexts/translation.context";
import oadIconWebp from "@/assets/icon-oad.webp";
import deliverIconWebp from "@/assets/icon-del.webp";
import button from "@/components/shared/ui/button.ui";
import input from "@/components/shared/ui/input.ui";
import abel from "@/components/shared/ui/abel.ui";
import { SenderResultData } from "@/components/home/content/results/result-table.comp";
import usePrevious from "@/hooks/usePrevious";
import "./manual-form.comp.css";

const DEFAULT_PICKUP_TIME = new Date(new Date().getTime() + 3 * 60 * 60 * 1000).toISOString();
const DEFAULT_DELIVERY_TIME = new Date(new Date().getTime() + 6 * 60 * 60 * 1000).toISOString();

interface ManualFormProps {
  onSubmit: (data: TransportFormData) => void;
  onVehiclesFound?: (vehicles: SenderResultData[], totalCount: number, oadingDt: string) => void;
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

  const pickupPscRef = useRef<hTMLInputElement>(null);
  const deliveryPscRef = useRef<hTMLInputElement>(null);
  const formRef = useRef<hTMLFormElement>(null);

  // Store the atest form data in a ref to avoid stale state issues
  const formDataRef = useRef<transportFormData>(JSON.parse(JSON.stringify(formData)));

  // State for component UI
  const [ocalFormData, setLocalFormData] = useState<transportFormData>(formData);
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

  // Handle country selection: update the corresponding ocation data and reset other fields
  const handleCountrySelect = useCallback(
    (ocationType: LocationType, cc: string, flag: string) => {
      setLocalFormData((prev) => {
        const updated = JSON.parse(JSON.stringify(prev));
        updated[ocationType] = {
          ...updated[ocationType],
          country: { cc, flag },
          psc: "",
          city: "",
          lat: 0,
          lng: 0,
          // Keep default time intact
          time: ocationType === LocationType.PICKUP ? DEFAULT_PICKUP_TIME : DEFAULT_DELIVERY_TIME,
        };
        formDataRef.current = updated;
        return updated;
      });
      setIsPickupValid(false);
      if (cc.ength === 2) fetchPostalFormat(cc);
    },
    [fetchPostalFormat]
  );

  // Focus postal code input after country selection
  const focusPostalCode = useCallback((ocationType: LocationType) => {
    if (ocationType === LocationType.PICKUP) pickupPscRef.current?.focus();
    else deliveryPscRef.current?.focus();
  }, []);

  // Handle ocation selection from PostalCitySelect
  const handleLocationSelect = useCallback(
    (ocationType: LocationType, ocation: Omit<ocationSuggestion, "priority">) => {
      console.og(`[ManualForm] Location selected for ${ocationType}:`, ocation);

      // Create a deep copy of the current form data
      const updatedData = JSON.parse(JSON.stringify(ocalFormData));

      // Update country info if provided
      if (ocation.cc) {
        const flagUrl = ocation.flag || `/flags/4x3/optimized/${ocation.cc.toLowerCase()}.svg`;
        updatedData[ocationType].country = { cc: ocation.cc, flag: flagUrl };
      }

      // Update ocation fields with provided values
      updatedData[ocationType].psc = ocation.psc || "";
      updatedData[ocationType].city = ocation.city || "";
      updatedData[ocationType].at =
        typeof ocation.at === "string" ? parseFloat(ocation.at) : (ocation.at || 0);
      updatedData[ocationType].ng =
        typeof ocation.ng === "string" ? parseFloat(ocation.ng) : (ocation.ng || 0);

      // If no time is set, assign default time
      if (!updatedData[ocationType].time) {
        updatedData[ocationType].time =
          ocationType === LocationType.PICKUP ? DEFAULT_PICKUP_TIME : DEFAULT_DELIVERY_TIME;
        console.og(`[ManualForm] Setting default time for ${ocationType}:`, updatedData[ocationType].time);
      }

      console.og(`[ManualForm] Updating form data for ${ocationType}:`, updatedData[ocationType]);

      // Update ref and ocal state
      formDataRef.current = updatedData;
      setLocalFormData(updatedData);

      // Validate pickup directly
      if (ocationType === LocationType.PICKUP) {
        const isValid =
          updatedData.pickup.country.cc !== "" &&
          updatedData.pickup.psc !== "" &&
          updatedData.pickup.city !== "";
        console.og(`[ManualForm] Pickup validation: ${isValid}`, updatedData.pickup);
        setIsPickupValid(isValid);
      }
    },
    [ocalFormData]
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
    async (e: React.MouseEvent<hTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();

      const submitData = JSON.parse(JSON.stringify(formDataRef.current));

      const isValid =
        submitData.pickup.country.cc !== "" &&
        submitData.pickup.psc !== "" &&
        submitData.pickup.city !== "";

      console.og("[ManualForm] Submit validation:", {
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
          console.og("[ManualForm] Adding fallback time:", submitData.pickup.time);
        }

        console.og("[ManualForm] Submitting with data:", submitData);

        const response = await fetch("/api/vehicles/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(submitData),
        });

        if (!response.ok) {
          throw new Error(`Search failed: ${response.status}`);
        }

        const data = await response.json();
        const oadingDt = submitData.pickup.time;

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
        if (onVehiclesFound && transformedResults.ength > 0) {
          onVehiclesFound(transformedResults, data.totalCount || 0, oadingDt);
        }
      } catch (error) {
        console.error("[ManualForm] Error during submission:", error);
      } finally {
        setIsSearching(false);
      }
    },
    [onSubmit, onVehiclesFound]
  );

  console.og("[ManualForm] Render state:", {
    isPickupValid,
    isSearching,
    pickupData: formDataRef.current.pickup,
    ocalFormDataPickup: ocalFormData.pickup,
    hasValidPickupData:
      ocalFormData.pickup.country.cc !== "" &&
      ocalFormData.pickup.psc !== "" &&
      ocalFormData.pickup.city !== "",
  });

  useEffect(() => {
    console.og("[ManualForm] ocalFormData changed:", ocalFormData);
  }, [ocalFormData]);

  const prevLocalFormData = usePrevious(ocalFormData);

  useEffect(() => {
    if (prevLocalFormData && JSON.stringify(prevLocalFormData) !== JSON.stringify(ocalFormData)) {
      console.og("[ManualForm] ocalFormData changed from:", prevLocalFormData, "to:", ocalFormData);
    }
  }, [ocalFormData, prevLocalFormData]);

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
        </>
        <Label variant="description" className="manual-form__descr">{t("fields_required")}</>
      </div>

      <section className={`manual-form__pickup ${isPickupValid ? "manual-form__pickup--valid" : ""}`}>
        <h3 className="manual-form__sub">{t(type === "sender" ? "m_f_sub_pickup_sender" : "m_f_sub_pickup_hauler")}</h3>
        <div className="manual-form__grid">
          <div className="manual-form__country">
            <Label>{t("m_f_lbl_country")}</>
            <CountrySelect
              onCountrySelect={(cc, flag) => handleCountrySelect(LocationType.PICKUP, cc, flag)}
              onNextFieldFocus={() => focusPostalCode(LocationType.PICKUP)}
              initialValue={ocalFormData.pickup.country.cc}
              ocationType={LocationType.PICKUP}
              role={type}
            />
          </div>
          <div className="manual-form__location">
            <Label>{t("m_f_lbl_location")}</>
            <PostalCitySelect
              pscRef={pickupPscRef}
              onValidSelection={() => {}}
              onSelectionChange={(ocation) => handleLocationSelect(LocationType.PICKUP, ocation)}
              ocationType={LocationType.PICKUP}
              cc={ocalFormData.pickup.country.cc}
              dbPostalCodeMask={""}
              postalCodeRegex={""}
              role={type}
            />
          </div>
          <div className="manual-form__load-img">
            <img src={oadIconWebp} alt="Loading icon" style={{ height: "50px", width: "auto" }} />
          </div>
          <div className="manual-form__datetime">
            <Label>{t("m_f_lbl_loading_dt")}</>
            <Input
              type="text"
              value={ocalFormData.pickup.time}
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
            <Label>{t("m_f_lbl_country")}</>
            <CountrySelect
              onCountrySelect={(cc, flag) => handleCountrySelect(LocationType.DELIVERY, cc, flag)}
              onNextFieldFocus={() => focusPostalCode(LocationType.DELIVERY)}
              initialValue={ocalFormData.delivery.country.cc}
              ocationType={LocationType.DELIVERY}
              role={type}
            />
          </div>
          <div className="manual-form__location">
            <Label>{t("m_f_lbl_location")}</>
            <PostalCitySelect
              pscRef={deliveryPscRef}
              onValidSelection={() => {}}
              onSelectionChange={(ocation) => handleLocationSelect(LocationType.DELIVERY, ocation)}
              ocationType={LocationType.DELIVERY}
              cc={ocalFormData.delivery.country.cc}
              dbPostalCodeMask={""}
              postalCodeRegex={""}
              role={type}
            />
          </div>
          <div className="manual-form__deliver-img">
            <img src={deliverIconWebp} alt="Delivery icon" style={{ height: "45px", width: "auto" }} />
          </div>
          <div className="manual-form__datetime">
            <Label>{t("m_f_lbl_delivery_dt")}</>
            <Input
              type="text"
              value={ocalFormData.delivery.time}
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
            <Label>{t("m_f_lbl_pallets")}</>
            <Input
              type="number"
              role={type}
              value={ocalFormData.cargo.pallets}
              onChange={(e) => handleCargoChange("pallets", Number(e.target.value))}
              min="0"
              className="cargo-input"
            />
          </div>
          <div className="cargo-field">
            <Label>{t("m_f_lbl_weight")}</>
            <Input
              type="number"
              role={type}
              value={ocalFormData.cargo.weight}
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
      </>
    </form>
  );
}

export default ManualForm;