// File: src/components/sections/content/results/result-table.component.tsx
// Description: Table component to display search results for sender or hauler, showing yesterday's data from backend

import React, { useState } from "react";
import "./result-table.css";

export interface SenderResultData {
  distance: string; // e.g., "15.4 km"
  vehicleType: string;
  availabilityTime: string;
  eta: string;
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
  data: SenderResultData[] | HaulerResultData[];
}

// Extract date as MM/DD from any malformed time string
const formatAvailabilityTime = (time: string): string => {
  try {
    // Split the string at 'T' and take the first part
    const [datePart] = time.split("T");
    if (!datePart) {
      console.warn(`[ResultTable] No date part found in availability time: ${time}`);
      return "N/A";
    }

    // Extract month and day from the date part (e.g., "Wed Mar 05 2025 00:00:00 GMT+0100")
    const parts = datePart.split(" ");
    if (parts.length < 3) {
      console.warn(`[ResultTable] Malformed date part in availability time: ${time}`);
      return "N/A";
    }

    const monthStr = parts[1]; // e.g., "Mar"
    const dayStr = parts[2]; // e.g., "05"

    // Map month abbreviation to number
    const monthMap: { [key: string]: string } = {
      Jan: "01",
      Feb: "02",
      Mar: "03",
      Apr: "04",
      May: "05",
      Jun: "06",
      Jul: "07",
      Aug: "08",
      Sep: "09",
      Oct: "10",
      Nov: "11",
      Dec: "12",
    };

    const month = monthMap[monthStr];
    const day = String(dayStr).padStart(2, "0");

    if (!month || !day) {
      console.warn(`[ResultTable] Unable to parse month or day from: ${time}`);
      return "N/A";
    }

    return `${month}/${day}`;
  } catch (error) {
    console.warn(`[ResultTable] Error parsing availability time: ${time}`, error);
    return "N/A";
  }
};

// Format ETA as H (e.g., 14)
const formatETA = (eta: string): string => {
  const date = new Date(eta);
  if (isNaN(date.getTime())) {
    console.warn(`[ResultTable] Invalid ETA: ${eta}`);
    return "N/A";
  }
  return String(date.getHours());
};

// Format rating with star and one decimal place
const formatRating = (rating?: number): string => {
  return rating !== undefined ? `★ ${rating.toFixed(1)}` : "★ N/A";
};

const ResultTable: React.FC<ResultTableProps> = ({ type, data }) => {
  const [filter, setFilter] = useState<string>("all");

  // Define table columns based on type
  const columns =
    type === "sender"
      ? [
          { label: "Distance", key: "distance" },
          { label: "Vehicle Type", key: "vehicleType" },
          { label: "Availability Time", key: "availabilityTime" },
          { label: "ETA", key: "eta" },
          { label: "PP", key: "pp" },
          { label: "Rating", key: "rating" },
        ]
      : [
          { label: "Pickup", key: "pickup" },
          { label: "Delivery", key: "delivery" },
          { label: "Pallets", key: "pallets" },
          { label: "Weight", key: "weight" },
          { label: "Rating", key: "rating" },
        ];

  // Extract unique vehicle types for filtering (sender only)
  const vehicleTypes =
    type === "sender"
      ? ["all", ...new Set((data as SenderResultData[]).map((item) => item.vehicleType))]
      : ["all"];

  // Filter data: show only entries with distance < 500 km for sender type (date filtering done in backend)
  const filteredData =
    type === "sender"
      ? (data as SenderResultData[])
          .filter((item) => {
            const distanceNum = parseFloat(item.distance);
            return !isNaN(distanceNum) && distanceNum < 500;
          })
          .filter((item) => filter === "all" || item.vehicleType === filter)
      : data;

  // Render empty state if no data is available
  if (!data || data.length === 0) {
    return (
      <div className="result-table-container">
        <p>No vehicles found.</p>
      </div>
    );
  }

  return (
    <div className="result-table-container">
      {type === "sender" && (
        <div className="result-table-filter">
          <label htmlFor="vehicleFilter">Filter by Vehicle Type: </label>
          <select
            id="vehicleFilter"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
          >
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>
                {type === "all" ? "All Types" : type}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="result-table-scroll">
        <table className="result-table__table">
          <thead className="result-table__header">
            <tr className="result-table__header-row">
              {columns.map((col) => (
                <th key={col.key} className="result-table__header-cell">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="result-table__body">
            {filteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className="result-table__body-row">
                {columns.map((col) => (
                  <td key={col.key} className="result-table__body-cell">
                    {col.key === "rating"
                      ? formatRating((row as any)[col.key])
                      : col.key === "availabilityTime" && type === "sender"
                      ? formatAvailabilityTime((row as SenderResultData).availabilityTime)
                      : col.key === "eta" && type === "sender"
                      ? formatETA((row as SenderResultData).eta)
                      : (row as any)[col.key]?.toString() || "N/A"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

ResultTable.defaultProps = {
  data: [],
};

export default ResultTable;