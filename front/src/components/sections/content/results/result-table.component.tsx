import React, { useState, useEffect, useRef } from "react";
import "./result-table.css";
import { getAnimatedArrow } from "@/utils/animateArrow";
import DistanceFilter from "./DistanceFilter";
import TypeFilter from "./TypeFilter";
import StatusFilter from "./StatusFilter";
import BaseFilter from "./BaseFilter";
import truckIcon from "@/assets/truck.svg";
import vanIcon from "@/assets/van.svg";
import lorryIcon from "@/assets/lorry.svg";
import rigidIcon from "@/assets/rigid.svg";

export interface SenderResultData {
  distance: string;
  vehicleType: string;
  availabilityTime: string;
  eta: string;
  rating?: number;
  pp: number;
}

interface ResultTableProps {
  type: "sender" | "hauler";
  data?: SenderResultData[];
}

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

// Map vehicle types to icons
const vehicleIcons: { [key: string]: string } = {
  truck: truckIcon,
  van: vanIcon,
  lorry: lorryIcon,
  rigid: rigidIcon,
};

// Determine status value (G/O/R)
const getStatusValue = (record: SenderResultData): string => {
  const now = new Date();
  const availTime = new Date(record.availabilityTime);
  const loadingTime = new Date(record.eta);
  if (availTime < loadingTime && availTime < now) return "G";
  else if (availTime < loadingTime && availTime > now) return "O";
  else if (availTime > loadingTime) return "R";
  return "";
};

const ResultTable: React.FC<ResultTableProps> = ({ type, data = [] }) => {
  if (type !== "sender") {
    return (
      <div className="result-table">
        <p>Hauler filtering not implemented.</p>
      </div>
    );
  }

  const senderData = data as SenderResultData[];
  const [distanceFilteredData, setDistanceFilteredData] = useState(senderData);
  const [typeFilteredData, setTypeFilteredData] = useState(senderData);
  const [statusFilteredData, setStatusFilteredData] = useState(senderData);
  const [availabilityFilteredData, setAvailabilityFilteredData] = useState(senderData);
  const [etaFilteredData, setEtaFilteredData] = useState(senderData);
  const [ppFilteredData, setPpFilteredData] = useState(senderData);
  const [ratingFilteredData, setRatingFilteredData] = useState(senderData);

  const distanceFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const typeFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const statusFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const availabilityFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const etaFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const ppFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const ratingFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);

  const columns = [
    { label: "Distance", key: "distance", ref: distanceFilterRef, component: DistanceFilter, onFilter: setDistanceFilteredData, data: senderData },
    { label: "Type", key: "type", ref: typeFilterRef, component: TypeFilter, onFilter: setTypeFilteredData, data: distanceFilteredData },
    { label: "Status", key: "status", ref: statusFilterRef, component: StatusFilter, onFilter: setStatusFilteredData, data: typeFilteredData },
    {
      label: "Availability",
      key: "availability",
      ref: availabilityFilterRef,
      component: BaseFilter,
      onFilter: setAvailabilityFilteredData,
      data: statusFilteredData,
      options: availabilityFilterOptions,
      filterFn: (data: SenderResultData[], selected: string) => {
        if (selected === "all") return data;
        return data.filter(record => {
          const availDate = new Date(record.availabilityTime);
          const now = new Date();
          if (selected === "passed") return availDate < now;
          if (selected === "today") return availDate.toDateString() === now.toDateString();
          if (selected === "tomorrow") {
            const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
            return availDate.toDateString() === tomorrow.toDateString();
          }
          return true;
        });
      },
    },
    {
      label: "ETA",
      key: "eta",
      ref: etaFilterRef,
      component: BaseFilter,
      onFilter: setEtaFilteredData,
      data: availabilityFilteredData,
      options: etaFilterOptions,
      filterFn: (data: SenderResultData[], selected: string) => {
        if (selected === "all") return data;
        const thresholdHours = parseFloat(selected);
        const now = new Date();
        return data.filter(record => {
          const etaDate = new Date(record.eta);
          const diffHours = (etaDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          return diffHours <= thresholdHours;
        });
      },
    },
    {
      label: "PP",
      key: "pp",
      ref: ppFilterRef,
      component: BaseFilter,
      onFilter: setPpFilteredData,
      data: etaFilteredData,
      options: ppFilterOptions,
      filterFn: (data: SenderResultData[], selected: string) => {
        if (selected === "all") return data;
        return data.filter(record => selected === "verified" && record.pp > 0);
      },
    },
    {
      label: "Rating",
      key: "rating",
      ref: ratingFilterRef,
      component: BaseFilter,
      onFilter: setRatingFilteredData,
      data: ppFilteredData,
      options: ratingFilterOptions,
      filterFn: (data: SenderResultData[], selected: string) => {
        if (selected === "all") return data;
        const thresholdRating = parseFloat(selected);
        return data.filter(record => record.rating !== undefined && record.rating >= thresholdRating);
      },
    },
  ];

  const appliedFilters = columns.filter(col => col.ref.current?.isFiltered()).map(col => col.label);

  const resetFilters = () => {
    columns.forEach(col => col.ref.current?.reset());
    setDistanceFilteredData(senderData);
    setTypeFilteredData(senderData);
    setStatusFilteredData(senderData);
    setAvailabilityFilteredData(senderData);
    setEtaFilteredData(senderData);
    setPpFilteredData(senderData);
    setRatingFilteredData(senderData);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        columns.forEach(col => {
          if (col.ref.current?.isOpen()) col.ref.current.reset();
        });
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        columns.forEach(col => {
          if (col.ref.current?.isOpen()) col.ref.current.reset();
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [columns]);

  return (
    <div className="result-table">
      <div className="result-table__filter-summary">
        <span>
          {appliedFilters.length > 0
            ? `Filtered by ${appliedFilters.length} column(s) - ${appliedFilters.join(", ")}`
            : "No filter is applied"}
        </span>
        <button className="result-table__reset-button" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>
      <table className="result-table__table">
        <thead ref={headerRef} className="result-table__header">
          <tr className="result-table__header-row">
            {columns.map(col => (
              <th
                key={col.key}
                className={`result-table__header-cell ${col.ref.current?.isFiltered() ? "result-table__header-cell--filtered" : ""}`}
              >
                <col.component
                  data={col.data}
                  onFilter={col.onFilter}
                  ref={col.ref}
                  label={col.label}
                  options={col.options}
                  filterFn={col.filterFn}
                />
              </th>
            ))}
          </tr>
        </thead>
      </table>
      <div className="result-table__scroll">
        <table className="result-table__table">
          <tbody className="result-table__body">
            {ratingFilteredData.length === 0 ? (
              <tr className="result-table__body-row">
                <td className="result-table__body-cell" colSpan={columns.length}>
                  Your requirements do not match any record
                </td>
              </tr>
            ) : (
              ratingFilteredData.map((row, rowIndex) => (
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
                      const etaDate = new Date(row.eta);
                      return (
                        <td key={col.key} className="result-table__body-cell">
                          {isNaN(etaDate.getTime()) ? "N/A" : etaDate.getHours()}
                        </td>
                      );
                    }
                    if (col.key === "type") {
                      return (
                        <td key={col.key} className="result-table__body-cell">
                          {row.vehicleType}
                        </td>
                      );
                    }
                    if (col.key === "status") {
                      const statusVal = getStatusValue(row);
                      let statusColor = "grey";
                      let statusText = "";
                      switch (statusVal) {
                        case "G": statusColor = "#00FF00"; statusText = "available now"; break;
                        case "O": statusColor = "#FFA500"; statusText = "available as scheduled"; break;
                        case "R": statusColor = "#FF0000"; statusText = "available later"; break;
                        default: break;
                      }
                      const vehicleIcon = vehicleIcons[row.vehicleType.toLowerCase()] || truckIcon;
                      return (
                        <td key={col.key} className="result-table__body-cell">
                          <div style={{ display: "flex", alignItems: "center" }}>
                            <img
                              src={vehicleIcon}
                              alt={`${row.vehicleType} Icon`}
                              style={{ width: "24px", filter: `drop-shadow(0 0 0 ${statusColor})`, marginRight: "8px" }}
                            />
                            <span style={{ color: "grey" }}>{statusVal} - {statusText}</span>
                          </div>
                        </td>
                      );
                    }
                    if (col.key === "availability") {
                      const availDate = new Date(row.availabilityTime);
                      const now = new Date();
                      let availLabel = "";
                      if (availDate < now) availLabel = "passed";
                      else if (availDate.toDateString() === now.toDateString()) availLabel = "today";
                      else {
                        const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
                        if (availDate.toDateString() === tomorrow.toDateString()) availLabel = "tomorrow";
                        else availLabel = availDate.toLocaleDateString();
                      }
                      return (
                        <td key={col.key} className="result-table__body-cell">
                          {availLabel}
                        </td>
                      );
                    }
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