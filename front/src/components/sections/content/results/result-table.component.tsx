// File: src/components/sections/content/results/ResultTable.tsx
// Description: Table component to display sender results with per-column filtering using BEM.
// When a filter is applied, the corresponding header cell gets a blue-gray background.
// Each dropdown closes after selection or when clicking outside.

import React, { useState, useEffect, useRef } from "react";
import "./result-table.css";
import BaseDropdown from "@/components/elements/BaseDropdown";
import { getAnimatedArrow } from "@/utils/animateArrow";
import IconFilter from "./IconFilter";
import truckIcon from "@/assets/truck40.svg"; // correct image import

// Data interfaces
export interface SenderResultData {
  distance: string;         // e.g., "15.4 km"
  vehicleType: string;      // DB values: LKW, Sólo, Dodávka, Avia
  availabilityTime: string; // ISO string, e.g., "2025-03-05T00:00:00Z"
  eta: string;              // ISO string – loading time
  rating?: number;
  pp: number;
}

export interface HaulerResultData {
  pickup: string;
  delivery: string;
  pallets: number;
  weight: string;
  rating?: number;
}

interface ResultTableProps {
  type: "sender" | "hauler";
  data?: SenderResultData[] | HaulerResultData[];
}

// Filter options for sender columns – always include "All" as first item.
const distanceFilterOptions = [
  { value: "all", label: "All" },
  { value: "20", label: "up to 20km" },
  { value: "50", label: "up to 50km" },
  { value: "100", label: "up to 100km" },
  { value: "200", label: "up to 200km" },
];

const typeFilterOptions = [
  { value: "all", label: "All" },
  { value: "LKW", label: "truck 40t." },
  { value: "Sólo", label: "rigid 12t." },
  { value: "Dodávka", label: "van 3,5t." },
  { value: "Avia", label: "lorry 7,5t." },
];

const availabilityFilterOptions = [
  { value: "all", label: "All" },
  { value: "passed", label: "passed" },
  { value: "today", label: "today" },
  { value: "tomorrow", label: "tomorrow" },
];

const etaFilterOptions = [
  { value: "all", label: "All" },
  { value: "1", label: "up to 1 hr" },
  { value: "2", label: "up to 2 hrs" },
  { value: "5", label: "up to 5 hrs" },
];

const ppFilterOptions = [
  { value: "all", label: "All" },
  { value: "verified", label: "verified" },
];

const ratingFilterOptions = [
  { value: "all", label: "All" },
  { value: "4.5", label: "4,5 and more" },
  { value: "4.0", label: "4,0 and more" },
  { value: "3.5", label: "3,5 and more" },
];

// Helper function to compute the icon filter value ("G", "Y", or "O") for a record
const getIconValue = (record: SenderResultData): string => {
  const currentTime = new Date();
  const availTime = new Date(record.availabilityTime);
  const loadingTime = new Date(record.eta);

  if (availTime < currentTime) {
    return "G"; // Green: available now (passed)
  } else if (availTime >= currentTime && availTime < loadingTime) {
    return "Y"; // Yellow: available on time (planned on time)
  } else if (availTime >= currentTime && availTime >= loadingTime) {
    return "O"; // Orange: available after loading time
  }
  return "";
};

const ResultTable: React.FC<ResultTableProps> = ({ type, data = [] }) => {
  // Filtering is implemented only for sender type
  if (type !== "sender") {
    return (
      <div className="result-table-container">
        <p>Hauler filtering not implemented.</p>
      </div>
    );
  }

  const senderData = data as SenderResultData[];

  // States for each filter column
  const [selectedDistance, setSelectedDistance] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedIcon, setSelectedIcon] = useState(""); // Empty means no filter
  const [selectedAvailability, setSelectedAvailability] = useState("all");
  const [selectedETA, setSelectedETA] = useState("all");
  const [selectedPP, setSelectedPP] = useState("all");
  const [selectedRating, setSelectedRating] = useState("all");

  // State for open dropdowns in header (key = column key)
  const [filterOpen, setFilterOpen] = useState<{ [key: string]: boolean }>({});
  const headerRef = useRef<HTMLTableSectionElement>(null);

  // Define columns with optional filter options and setters
  const columns = [
    { label: "Distance", key: "distance", filterOptions: distanceFilterOptions, selected: selectedDistance, setSelected: setSelectedDistance },
    { label: "Type", key: "type", filterOptions: typeFilterOptions, selected: selectedType, setSelected: setSelectedType },
    { label: "Icon", key: "icon", filterOptions: [{ value: "all", label: "All" }], selected: selectedIcon, setSelected: setSelectedIcon },
    { label: "Availability", key: "availability", filterOptions: availabilityFilterOptions, selected: selectedAvailability, setSelected: setSelectedAvailability },
    { label: "ETA", key: "eta", filterOptions: etaFilterOptions, selected: selectedETA, setSelected: setSelectedETA },
    { label: "PP", key: "pp", filterOptions: ppFilterOptions, selected: selectedPP, setSelected: setSelectedPP },
    { label: "Rating", key: "rating", filterOptions: ratingFilterOptions, selected: selectedRating, setSelected: setSelectedRating },
  ];

  // Apply filtering on senderData
  const filteredData = senderData.filter(record => {
    // Distance filter
    if (selectedDistance !== "all") {
      const threshold = parseFloat(selectedDistance);
      const recordDistance = parseFloat(record.distance);
      if (isNaN(recordDistance) || recordDistance >= threshold) {
        return false;
      }
    }
    // Type filter
    if (selectedType !== "all" && record.vehicleType !== selectedType) {
      return false;
    }
    // Icon filter
    if (selectedIcon && selectedIcon !== "all" && getIconValue(record) !== selectedIcon) {
      return false;
    }
    // Availability filter
    if (selectedAvailability !== "all") {
      const availDate = new Date(record.availabilityTime);
      const now = new Date();
      if (selectedAvailability === "passed") {
        if (availDate >= now) return false;
      } else if (selectedAvailability === "today") {
        if (!(availDate.getFullYear() === now.getFullYear() &&
              availDate.getMonth() === now.getMonth() &&
              availDate.getDate() === now.getDate())) {
          return false;
        }
      } else if (selectedAvailability === "tomorrow") {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        if (!(availDate.getFullYear() === tomorrow.getFullYear() &&
              availDate.getMonth() === tomorrow.getMonth() &&
              availDate.getDate() === tomorrow.getDate())) {
          return false;
        }
      }
    }
    // ETA filter
    if (selectedETA !== "all") {
      const thresholdHours = parseFloat(selectedETA);
      const now = new Date();
      const etaDate = new Date(record.eta);
      const diffHours = (etaDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      if (diffHours > thresholdHours) {
        return false;
      }
    }
    // PP filter – assume "verified" means pp > 0
    if (selectedPP === "verified" && !(record.pp > 0)) {
      return false;
    }
    // Rating filter
    if (selectedRating !== "all") {
      const thresholdRating = parseFloat(selectedRating);
      if (record.rating === undefined || record.rating < thresholdRating) {
        return false;
      }
    }
    return true;
  });

  // Calculate applied filters and their names for display above the table
  const appliedFilters: string[] = [];
  if (selectedDistance !== "all") appliedFilters.push("Distance");
  if (selectedType !== "all") appliedFilters.push("Type");
  if (selectedIcon && selectedIcon !== "all") appliedFilters.push("Icon");
  if (selectedAvailability !== "all") appliedFilters.push("Availability");
  if (selectedETA !== "all") appliedFilters.push("ETA");
  if (selectedPP !== "all") appliedFilters.push("PP");
  if (selectedRating !== "all") appliedFilters.push("Rating");

  // Function to reset all filters
  const resetFilters = () => {
    setSelectedDistance("all");
    setSelectedType("all");
    setSelectedIcon("");
    setSelectedAvailability("all");
    setSelectedETA("all");
    setSelectedPP("all");
    setSelectedRating("all");
  };

  // Toggle dropdown for a given column key
  const toggleFilter = (columnKey: string) => {
    setFilterOpen(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey],
    }));
  };

  // Close dropdowns when clicking outside header
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setFilterOpen({});
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Render filter content for a column that has filter options
  const renderFilterContent = (col: any) => {
    if (col.key === "icon") {
      // Render external IconFilter for Icon column using BEM classes
      return (
        <div className="dropdown-icon__content">
          <IconFilter
            onSelect={(value: string) => {
              setSelectedIcon(value === "all" ? "" : value);
              setFilterOpen(prev => ({ ...prev, icon: false }));
            }}
          />
        </div>
      );
    }
    if (!col.filterOptions) return null;
    return (
      <div className="dropdown__content">
        {col.filterOptions.map((option: any) => (
          <div
            key={option.value}
            className="dropdown__item"
            onClick={() => {
              col.setSelected(option.value);
              setFilterOpen(prev => ({ ...prev, [col.key]: false }));
            }}
            style={{ padding: "8px 12px", cursor: "pointer" }}
          >
            {option.label}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="result-table-container">
      {/* Filter summary and reset button */}
      <div style={{ marginBottom: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          {appliedFilters.length > 0
            ? `Filtered by ${appliedFilters.length} column(s) - ${appliedFilters.join(", ")}`
            : "No filter is applied"}
        </div>
        <button onClick={resetFilters} style={{ padding: "5px 10px", fontSize: "14px", cursor: "pointer" }}>
          Reset Filters
        </button>
      </div>

      <div className="result-table-scroll">
        <table className="result-table__table">
          <thead ref={headerRef} className="result-table__header">
            <tr className="result-table__header-row">
              {columns.map(col => {
                // Determine if a filter is applied for this column (excluding "all")
                const isFiltered = col.filterOptions && col.selected && col.selected !== "all";
                const isOpen = col.filterOptions && filterOpen[col.key];
                return (
                  <th
                    key={col.key}
                    className={`result-table__header-cell ${isFiltered ? "result-table__header-cell--filtered" : ""} ${isOpen ? "result-table__header-cell--open" : ""}`}
                    style={{ position: "relative", cursor: col.filterOptions ? "pointer" : "default" }}
                    onClick={() => col.filterOptions && toggleFilter(col.key)}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <span>{col.label}</span>
                      {col.filterOptions && getAnimatedArrow(Boolean(filterOpen[col.key]))}
                    </div>
                    {col.filterOptions && filterOpen[col.key] && (
                      <div className="dropdown__container" style={{ position: "absolute", top: "100%", left: 0, zIndex: 2 }}>
                        {renderFilterContent(col)}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="result-table__body">
            {filteredData.length === 0 ? (
              <tr className="result-table__body-row">
                <td className="result-table__body-cell" colSpan={columns.length}>
                  Your requirements do not match any record
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIndex) => (
                <tr key={rowIndex} className="result-table__body-row">
                  {columns.map(col => {
                    if (col.key === "rating") {
                      return (
                        <td key={col.key} className="result-table__body-cell">
                          {row.rating !== undefined ? `★ ${row.rating.toFixed(1)}` : "★ N/A"}
                        </td>
                      );
                    }
                    if (col.key === "eta") {
                      const etaDate = new Date((row as SenderResultData).eta);
                      return (
                        <td key={col.key} className="result-table__body-cell">
                          {isNaN(etaDate.getTime()) ? "N/A" : etaDate.getHours()}
                        </td>
                      );
                    }
                    if (col.key === "type") {
                      return (
                        <td key={col.key} className="result-table__body-cell">
                          {(row as SenderResultData).vehicleType}
                        </td>
                      );
                    }
                    if (col.key === "icon") {
                      const record = row as SenderResultData;
                      const iconVal = getIconValue(record);
                      let iconColor = "grey";
                      let iconText = "";
                      switch (iconVal) {
                        case "G":
                          iconColor = "green";
                          iconText = "available now";
                          break;
                        case "Y":
                          iconColor = "yellow";
                          iconText = "available on time";
                          break;
                        case "O":
                          iconColor = "orange";
                          iconText = "available after loading time";
                          break;
                        default:
                          break;
                      }
                      return (
                        <td key={col.key} className="result-table__body-cell">
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <img
                              src={truckIcon}
                              alt="Truck Icon"
                              style={{
                                width: "24px",
                                filter: `drop-shadow(0 0 0 ${iconColor})`,
                                marginRight: "8px",
                              }}
                            />
                            <span style={{ color: "grey" }}>
                              {iconVal} - {iconText}
                            </span>
                          </div>
                        </td>
                      );
                    }
                    if (col.key === "availability") {
                      const availDate = new Date((row as SenderResultData).availabilityTime);
                      const now = new Date();
                      let availLabel = "";
                      if (availDate < now) {
                        availLabel = "passed";
                      } else {
                        const today = now.getDate();
                        const availDay = availDate.getDate();
                        const availMonth = availDate.getMonth();
                        const availYear = availDate.getFullYear();
                        if (availYear === now.getFullYear() && availMonth === now.getMonth() && availDay === now.getDate()) {
                          availLabel = "today";
                        } else {
                          const tomorrow = new Date(now);
                          tomorrow.setDate(now.getDate() + 1);
                          if (
                            availYear === tomorrow.getFullYear() &&
                            availMonth === tomorrow.getMonth() &&
                            availDay === tomorrow.getDate()
                          ) {
                            availLabel = "tomorrow";
                          } else {
                            availLabel = availDate.toLocaleDateString();
                          }
                        }
                      }
                      return (
                        <td key={col.key} className="result-table__body-cell">
                          {availLabel}
                        </td>
                      );
                    }
                    // Default rendering for other columns (e.g., Distance, PP)
                    return (
                      <td key={col.key} className="result-table__body-cell">
                        {(row as any)[col.key]?.toString() || "N/A"}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ResultTable;
