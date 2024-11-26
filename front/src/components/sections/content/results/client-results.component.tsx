// ./front/src/components/results/client-results.component.tsx
import React from "react";
import ResultTable, { ClientResultData } from "./result-table.component";

const ClientResults: React.FC = () => {
  const clientData: ClientResultData[] = [
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

  return (
    <div>
      <h3 className="text-xl font-bold mb-4 text-purple-700">
        Výsledky pre klientov
      </h3>
      <ResultTable type="client" data={clientData} />
    </div>
  );
};

export default ClientResults;
