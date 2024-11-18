// ./front/src/components/results/result-table.component.tsx

import React from "react";

interface ResultTableProps {
  columns: string[];
  data: Array<Record<string, any>>;
}

const ResultTable: React.FC<ResultTableProps> = ({ columns, data }) => {
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
              {columns.map((col) => (
                <td
                  key={col}
                  className="border-b p-2 text-gray-600 dark:text-gray-200"
                >
                  {row[col.toLowerCase()] || "N/A"}
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
