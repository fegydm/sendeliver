// File: src/components/ResultTable.tsx
// Last change: Unified sender and hauler logic into a single component

import React from "react";

export interface SenderResultData {
  distance: string;
  vehicleType: string;
  availabilityTime: string;
  eta: string;
}

export interface HaulerResultData {
  pickup: string;
  delivery: string;
  pallets: number;
  weight: string;
}

interface ResultTableProps {
  type: "sender" | "hauler";
  data: SenderResultData[] | HaulerResultData[];
}

const ResultTable: React.FC<ResultTableProps> = ({ type, data }) => {
  // Define columns dynamically based on type
  const columns =
    type === "sender"
      ? [
          { label: "Distance", key: "distance" },
          { label: "Vehicle Type", key: "vehicleType" },
          { label: "Availability Time", key: "availabilityTime" },
          { label: "ETA", key: "eta" },
        ]
      : [
          { label: "Pickup", key: "pickup" },
          { label: "Delivery", key: "delivery" },
          { label: "Pallets", key: "pallets" },
          { label: "Weight", key: "weight" },
        ];

  return (
    <div className={`result-table--${type}`}>
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
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="result-table__body-row">
              {columns.map((col) => (
                <td key={col.key} className="result-table__body-cell">
                  {(row as any)[col.key]?.toString() || "N/A"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
