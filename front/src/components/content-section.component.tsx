// ./front/src/components/content-section.component.tsx
import React, { ReactNode } from "react";
import { FaBox, FaTruck, FaRobot } from "react-icons/fa";
import QuickStats from "./quick-stats.component";

interface ContentSectionProps {
  type: "sender" | "carrier";
  isActive: boolean;
  showStats: boolean;
  children: ReactNode;
  onAIHelp?: () => void;
}

const ContentSection: React.FC<ContentSectionProps> = ({
  type,
  isActive,
  showStats,
  children,
  onAIHelp,
}) => {
  return (
    <section className="w-full p-6 bg-white rounded-lg shadow-sm">
      <div className="mb-6">
        <h2 className="flex items-center gap-3 text-xl font-semibold mb-2">
          {type === "sender" ? (
            <FaBox className="text-hauler-primary-500" />
          ) : (
            <FaTruck className="text-client-primary-500" />
          )}
          {type === "sender" ? "Odosielateľ" : "Prepravca"}

          {onAIHelp && (
            <button
              onClick={onAIHelp}
              className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all duration-200 ease-in-out"
            >
              <FaRobot className="text-lg" />
              <span>AI Asistent</span>
            </button>
          )}
        </h2>

        <p className="text-gray-600">
          {type === "sender"
            ? "Zadajte detaily vašej zásielky alebo použite AI asistenta pre rýchle spracovanie"
            : "Nájdite vhodné zásielky pre vaše vozidlá alebo ponúknite voľnú kapacitu"}
        </p>
      </div>

      {showStats && isActive && (
        <div className="mb-6">
          <QuickStats type={type} />
        </div>
      )}

      <div className="space-y-6">{children}</div>
    </section>
  );
};

export default ContentSection;
