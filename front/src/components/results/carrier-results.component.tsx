// ./front/src/components/results/carrier-results.component.tsx

import React from "react";
import ResultTable from "./result-table.component";

const CarrierResults: React.FC = () => {
  const carrierData = [
    { pickup: "Košice", delivery: "Bratislava", pallets: 10, weight: "5 t" },
    { pickup: "Praha", delivery: "Viedeň", pallets: 8, weight: "3 t" },
  ];

  const columns = ["Pickup", "Delivery", "Pallets", "Weight"];

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-green-700">
        Dostupné vozidlá
      </h3>
      <ResultTable columns={columns} data={carrierData} />
    </div>
  );
};

export default CarrierResults;
