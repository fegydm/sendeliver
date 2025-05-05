// File: front/src/components/hauler/fleet/sections/TopModules.tsx
import React, { useState } from "react";
import type { FleetModuleConfig } from "../interfaces";

export interface TopModulesProps {
  modules: FleetModuleConfig[];
  /** (fromIndex, toIndex) -> void */
  onReorder: (from: number, to: number) => void;
}

export const TopModules: React.FC<TopModulesProps> = ({
  modules,
  onReorder,
}) => {
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleDragStart = (idx: number) => setDragIndex(idx);
  const handleDragOver = (e: React.DragEvent) => e.preventDefault();
  const handleDrop = (idx: number) => {
    if (dragIndex === null || dragIndex === idx) return;
    onReorder(dragIndex, idx); // ► odovzdáme from/to
    setDragIndex(null);
  };

  return (
    <div className="top-modules">
      {modules.map(
        (m, idx) =>
          m.visible && (
            <div
              key={m.key}
              className={`module module-${m.key}`}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={handleDragOver}
              onDrop={() => handleDrop(idx)}
            >
              {m.component}
            </div>
          )
      )}
    </div>
  );
};
