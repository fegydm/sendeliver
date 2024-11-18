// ./front/src/components/content/sender-section.component.tsx

import React from "react";

interface SenderSectionProps {
  children: React.ReactNode;
}

const SenderSection: React.FC<SenderSectionProps> = ({ children }) => {
  return (
    <div>
      <h2 className="text-xl font-bold mb-4 text-purple-700">
        Klientska sekcia
      </h2>
      {children}
    </div>
  );
};

export default SenderSection;
