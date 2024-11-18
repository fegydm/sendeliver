// ./front/src/components/content/carrier-section.component.tsx

import React from "react";

interface CarrierSectionProps {
  children: React.ReactNode;
}

const CarrierSection: React.FC<CarrierSectionProps> = ({ children }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-green-700">
        Dopravcovská sekcia
      </h2>
      {children}
    </div>
  );
};

export default CarrierSection;
