// File: src/apps/hauler/operations/fleet/toolbar.fleet.tsx
// Last change: Refactored to use shared Toolbar with fleet-specific configuration

import React, { useState } from "react";
import { Toolbar, ToolbarAction } from "@/shared/layouts/toolbar/toolbar"; // Updated path to shared layouts
import type { ConnectorConfig } from "./interfaces.fleet";
import "./toolbar.fleet.css"; // Fleet-specific toolbar styles

interface ToolbarFleetProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  modules: ConnectorConfig[];
  onToggleModule: (key: string) => void;
  onMoveModule: (from: number, to: number) => void;
  totalVehicles?: number;
  selectedVehicles?: number;
  onAddVehicle?: () => void;
  onDeleteVehicle?: () => void;
  onToggleExpand?: () => void;
}

export const ToolbarFleet: React.FC<ToolbarFleetProps> = ({
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
  
  const handleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    onMoveModule(dragIndex, index);
    setDragIndex(null);
  };

  // Compose fleet-specific toolbar actions
  const actions: ToolbarAction[] = [];
  
  // Reset filters action
  actions.push({ 
    key: "reset", 
    icon: "📑", 
    title: "Show all vehicles", 
    onClick: onReset 
  });
  
  // Expand view action (optional)
  if (onToggleExpand) {
    actions.push({ 
      key: "expand", 
      icon: "⤢", 
      title: "Expand view", 
      onClick: onToggleExpand 
    });
  }
  
  // Module settings action
  actions.push({ 
    key: "settings", 
    icon: "⚙️", 
    title: "Module settings", 
    onClick: handleSettingsClick 
  });
  
  // Delete vehicle action (optional)
  if (onDeleteVehicle) {
    actions.push({ 
      key: "delete", 
      icon: "🗑️", 
      title: "Delete selected vehicle", 
      onClick: onDeleteVehicle, 
      disabled: selectedVehicles === 0,
      variant: "danger"
    });
  }
  
  // Add vehicle action (optional)
  if (onAddVehicle) {
    actions.push({ 
      key: "add", 
      icon: "➕", 
      title: "Add new vehicle", 
      onClick: onAddVehicle,
      variant: "primary"
    });
  }

  return (
    <div className="toolbar-fleet">
      {/* Use shared Toolbar component */}
      <Toolbar
        selectedCount={selectedVehicles}
        totalCount={totalVehicles}
        searchTerm={searchTerm}
        placeholder="Search vehicles..."
        onSearchChange={onSearchChange}
        actions={actions}
        className="toolbar-fleet__main"
      />

      {/* Fleet-specific modules dropdown */}
      {showSettings && (
        <div 
          className="toolbar-fleet__modules-dropdown" 
          onMouseLeave={() => setShowSettings(false)}
        >
          <div className="toolbar-fleet__modules-header">
            <h4>Module Settings</h4>
            <p>Configure visible modules and their order</p>
          </div>
          
          <div className="toolbar-fleet__modules-list">
            {modules.map((module, index) => (
              <div
                key={module.key}
                className="toolbar-fleet__module-row"
                draggable
                onDragStart={() => setDragIndex(index)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => handleDrop(index)}
              >
                <span className="toolbar-fleet__drag-handle" title="Drag to reorder">
                  ↕
                </span>
                <input
                  type="checkbox"
                  id={`module-${module.key}`}
                  checked={module.visible}
                  onChange={() => onToggleModule(module.key)}
                  className="toolbar-fleet__module-checkbox"
                />
                <label 
                  htmlFor={`module-${module.key}`}
                  className="toolbar-fleet__module-label"
                >
                  {module.label || module.key}
                </label>
              </div>
            ))}
          </div>
          
          <div className="toolbar-fleet__modules-footer">
            <small className="toolbar-fleet__hint">
              💡 Drag ↕ to change module order
            </small>
          </div>
        </div>
      )}
    </div>
  );
};


export default ToolbarFleet;