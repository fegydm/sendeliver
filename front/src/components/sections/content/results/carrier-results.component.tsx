// ./front/src/components/results/carrier-results.component.tsx
import React from "react";
import ResultTable, { CarrierResultData } from "./result-table.component";
// import "./carrier-results.component.css"; // Import CSS

const CarrierResults: React.FC = () => {
  const carrierData: CarrierResultData[] = [
    {
      pickup: "Košice",
      delivery: "Bratislava",
      pallets: 10,
      weight: "5 t",
    },
    {
      pickup: "Prague",
      delivery: "Vienna",
      pallets: 8,
      weight: "3 t",
    },
  ];

  return (
    <div className="carrier-results-container">
      <h3 className="carrier-results-title">Available Vehicles</h3>
      <ResultTable type="carrier" data={carrierData} />
    </div>
  );
};

export default CarrierResults;
