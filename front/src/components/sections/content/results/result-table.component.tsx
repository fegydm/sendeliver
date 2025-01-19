// ./front/src/components/results/result-table.component.tsx
import React from "react";
// import "./result-table.component.css"; // Import CSS styles

export interface ClientResultData {
  distance: string;
  vehicleType: string;
  availabilityTime: string;
  eta: string;
}

export interface CarrierResultData {
  pickup: string;
  delivery: string;
  pallets: number;
  weight: string;
}

interface ResultTableProps {
  type: "client" | "carrier";
  data: ClientResultData[] | CarrierResultData[];
}

const ResultTable: React.FC<ResultTableProps> = ({ type, data }) => {
  const columns =
    type === "client"
      ? ["Distance", "Vehicle Type", "Availability Time", "ETA"]
      : ["Pickup", "Delivery", "Pallets", "Weight"];

  const getKeyForColumn = (column: string): string => {
    const columnMappings: Record<string, string> = {
      Distance: "distance",
      "Vehicle Type": "vehicleType",
      "Availability Time": "availabilityTime",
      ETA: "eta",
      Pickup: "pickup",
      Delivery: "delivery",
      Pallets: "pallets",
      Weight: "weight",
    };
    return columnMappings[column] || column.toLowerCase();
  };

  return (
    <div className={`result-table-container ${type === "client" ? "" : "dark"}`}>
      <table className="result-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col) => {
                const key = getKeyForColumn(col);
                return <td key={col}>{(row as any)[key]?.toString() || "N/A"}</td>;
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
