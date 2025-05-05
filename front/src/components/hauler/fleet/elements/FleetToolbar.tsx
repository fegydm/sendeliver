// File: front/src/components/hauler/fleet/elements/FleetToolbar.tsx
import React, { useState } from "react";
import { Toolbar } from "@/components/shared/elements/Toolbar";
import type { FleetModuleConfig } from "../interfaces";

interface FleetToolbarProps {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  onReset: () => void;
  modules: FleetModuleConfig[];
  onToggleModule: (key: string) => void;
  onMoveModule: (from: number, to: number) => void;
}

/**
 * Fleet-specific toolbar wrapping the generic Toolbar component.
 * Allows search, reset, and module configuration dropdown.
 */
export const FleetToolbar: React.FC<FleetToolbarProps> = ({
  searchTerm,
  onSearchChange,
  onReset,
  modules,
  onToggleModule,
  onMoveModule,
}) => {
  const [open, setOpen] = useState(false);
  const [dragIdx, setDragIdx] = useState<number | null>(null);

  const handleDrop = (i: number) => {
    if (dragIdx === null || dragIdx === i) return;
    onMoveModule(dragIdx, i);
    setDragIdx(null);
  };

  return (
    <div className="fleet-toolbar-wrapper">
      {/* Generic Toolbar shared across all cards */}
      <Toolbar
        selectedCount={modules.filter(m => m.visible).length}
        totalCount={modules.length}
        onReset={onReset}
        onSettings={() => setOpen(!open)}
        searchTerm={searchTerm}
        onSearchChange={onSearchChange}
      />

      {/* Fleet-specific modules configuration dropdown */}
      {open && (
        <div className="modules-dropdown" onMouseLeave={() => setOpen(false)}>
          {modules.map((m, i) => (
            <div
              key={m.key}
              className="module-row"
              draggable
              onDragStart={() => setDragIdx(i)}
              onDragOver={e => e.preventDefault()}
              onDrop={() => handleDrop(i)}
            >
              <span className="drag-handle">↕</span>
              <input
                type="checkbox"
                checked={m.visible}
                onChange={() => onToggleModule(m.key)}
              />
              <span>{m.label ?? m.key}</span>
            </div>
          ))}
          <small className="hint">Ťahaj ↕ na zmenu poradia</small>
        </div>
      )}
    </div>
  );
};
