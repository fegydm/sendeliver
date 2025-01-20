// ./front/src/components/content/sender-section.component.tsx
import React from "react";

interface SenderSectionProps {
  children: React.ReactNode; // Content passed into the Sender section
}

const SenderSection: React.FC<SenderSectionProps> = ({ children }) => {
  return (
    <section className="sender-section">
      <h2 className="sender-section__title">Client Area</h2>
      {children}
    </section>
  );
};

export default SenderSection;
