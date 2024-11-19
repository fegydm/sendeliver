// ./front/src/components/results/result-table.component.tsx
import React from "react";

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
  // Definujeme columns podľa typu
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
    <div className="overflow-auto border rounded p-4 bg-white dark:bg-gray-800">
      <table className="table-auto w-full border-collapse text-left">
        <thead>
          <tr>
            {columns.map((col) => (
              <th
                key={col}
                className="border-b p-2 font-semibold text-gray-700 dark:text-gray-300"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              className="hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              {columns.map((col) => {
                const key = getKeyForColumn(col);
                return (
                  <td
                    key={col}
                    className="border-b p-2 text-gray-600 dark:text-gray-200"
                  >
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
