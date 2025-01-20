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
  // Define columns based on type
  const columns =
    type === "sender"
      ? ["Distance", "Vehicle Type", "Availability Time", "ETA"]
      : ["Pickup", "Delivery", "Pallets", "Weight"];

  // Map column names to data keys
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
    <div className={`result-table result-table--${type}`}>
      <table className="result-table__table">
        <thead className="result-table__header">
          <tr className="result-table__header-row">
            {columns.map((col) => (
              <th key={col} className="result-table__header-cell">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="result-table__body">
          {data.map((row, rowIndex) => (
            <tr key={rowIndex} className="result-table__body-row">
              {columns.map((col) => {
                const key = getKeyForColumn(col);
                return (
                  <td key={col} className="result-table__body-cell">
                    {(row as any)[key]?.toString() || "N/A"}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;
