// File: ./front/src/components/hauler/fleet/elements/FleetToolbar.tsx
// Last change: correct definitions

import React, { useState } from "react";
import { Toolbar, ToolbarAction } from "@/shared/elements/Toolbar";
import type { FleetModuleConfig } from "../interfaces";

interface FleetToolbarProps {
  searchTerm: string;
  onSearchChange: (v: string) => void;
  onReset: () => void;
  modules: FleetModuleConfig[];
  onToggleModule: (key: string) => void;
  onMoveModule: (from: number, to: number) => void;
  totalVehicles?: number;
  selectedVehicles?: number;
  onAddVehicle?: () => void;
  onDeleteVehicle?: () => void;
  onToggleExpand?: () => void;
}

export const FleetToolbar: React.FC<FleetToolbarProps> = ({
  searchTerm,
  onSearchChange,
  onReset,
  totalVehicles = 0,
  selectedVehicles = 0,
  onAddVehicle,
  onDeleteVehicle,
  modules,
  onToggleModule,
  onMoveModule,
  onToggleExpand,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleSettingsClick = () => setShowSettings(prev => !prev);
  const handleDrop = (i: number) => {
    if (dragIndex === null || dragIndex === i) return;
    onMoveModule(dragIndex, i);
    setDragIndex(null);
  };

  // Compose toolbar actions only when callback is provided
  const actions: ToolbarAction[] = [];
  actions.push({ key: "reset", icon: "📑", title: "Show all", onClick: onReset });
  if (onToggleExpand) {
    actions.push({ key: "expand", icon: "⤢", title: "Expand view", onClick: onToggleExpand });
  }
  actions.push({ key: "settings", icon: "⚙️", title: "Settings", onClick: handleSettingsClick });
  if (onDeleteVehicle) {
    actions.push({ key: "delete", icon: "🗑️", title: "Delete selected", onClick: onDeleteVehicle, disabled: selectedVehicles === 0 });
  }
  if (onAddVehicle) {
    actions.push({ key: "add", icon: "＋", title: "Add new", onClick: onAddVehicle });
  }

  return (
    <>
      <Toolbar
        selectedCount={selectedVehicles}
        totalCount={totalVehicles}
        searchTerm={searchTerm}
        placeholder="Vyhľadať..."
        onSearchChange={onSearchChange}
        actions={actions}
        className="fleet-toolbar"
      />

      {showSettings && (
        <div className="modules-dropdown" onMouseLeave={() => setShowSettings(false)}>
          {modules.map((m, i) => (
            <div
              key={m.key}
              className="module-row"
              draggable
              onDragStart={() => setDragIndex(i)}
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
    </>
  );
};

export default FleetToolbar;
