// ./front/src/components/results/client-results.component.tsx
import React from "react";
import ResultTable, { ClientResultData } from "./result-table.component";
// import "./client-results.component.css"; // Import CSS

const ClientResults: React.FC = () => {
  const clientData: ClientResultData[] = [
    {
      distance: "150 km",
      vehicleType: "Van",
      availabilityTime: "8:00",
      eta: "10:30",
    },
    {
      distance: "200 km",
      vehicleType: "Truck",
      availabilityTime: "6:00",
      eta: "9:00",
    },
  ];

  return (
    <div className="client-results-container">
      <h3 className="client-results-title">Client Results</h3>
      <ResultTable type="client" data={clientData} />
    </div>
  );
};

export default ClientResults;
