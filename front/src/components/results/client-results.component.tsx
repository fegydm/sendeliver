// ./front/src/components/results/client-results.component.tsx

import React from "react";
import ResultTable from "./result-table.component";

const ClientResults: React.FC = () => {
  const clientData = [
    {
      distance: "150 km",
      vehicleType: "Dodávka",
      availabilityTime: "8:00",
      eta: "10:30",
    },
    {
      distance: "200 km",
      vehicleType: "Kamión",
      availabilityTime: "6:00",
      eta: "9:00",
    },
  ];

  const columns = ["Distance", "Vehicle Type", "Availability Time", "ETA"];

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-purple-700">
        Výsledky pre klientov
      </h3>
      <ResultTable columns={columns} data={clientData} />
    </div>
  );
};

export default ClientResults;
