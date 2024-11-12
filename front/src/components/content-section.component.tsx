// ./front/src/components/content-section.component.tsx
import React, { ReactNode } from "react";
import { FaBox, FaTruck } from "react-icons/fa";
import QuickStats from "./quick-stats.component";

interface ContentSectionProps {
  type: "sender" | "carrier";
  isActive: boolean;
  showStats: boolean;
  children: ReactNode;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  type,
  isActive,
  showStats,
  children,
}) => {
  return (
    <section className="w-full">
      <div>
        <h2 className="flex items-center">
          {type === "sender" ? <FaBox /> : <FaTruck />}
          {type === "sender" ? "Odosielateľ" : "Prepravca"}
        </h2>
        <p>
          {type === "sender"
            ? "Zadajte detaily vašej zásielky alebo použite AI asistenta pre rýchle spracovanie"
            : "Nájdite vhodné zásielky pre vaše vozidlá alebo ponúknite voľnú kapacitu"}
        </p>
      </div>

      {showStats && isActive && <QuickStats type={type} />}

      {children}
    </section>
  );
};

export default ContentSection;
