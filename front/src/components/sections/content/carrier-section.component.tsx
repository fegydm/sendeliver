// ./front/src/components/content/sender-section.component.tsx
import React from "react";

interface SenderSectionProps {
  children: React.ReactNode;
}

const SenderSection: React.FC<SenderSectionProps> = ({ children }) => {
  return (
    <section className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
      <h2 className="text-xl font-bold mb-4 text-purple-700 text-center">
        Client area      
      </h2>
      {children}
    </section>
  );
};

export default SenderSection;
