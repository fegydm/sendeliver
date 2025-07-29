// File: src/apps/hauler/operations/fleet/toolbar.fleet.tsx
// Last change: Updated interface and implementation to match fleet.tsx requirements

import React, { useState } from "react";
import { Toolbar, ToolbarAction } from "@/shared/layouts/toolbar/toolbar";
import type { ConnectorConfig } from "./interfaces.fleet";

interface ToolbarFleetProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  modules: ConnectorConfig[];
  onToggleModule: (key: string) => void;
  onMoveModule: (from: number, to: number) => void;
  totalVehicles: number;
  filteredVehicles: number;
  selectedVehicle: any;
  currentIndex: number;
  onNavigatePrevious: () => void;
  onNavigateNext: () => void;
  canNavigatePrevious: boolean;
  canNavigateNext: boolean;
  onAddVehicle?: () => void;
  onDeleteVehicle?: () => void;
  onToggleExpand?: () => void;
  onToggleView?: () => void;
  isTableView?: boolean;
}

export const ToolbarFleet: React.FC<ToolbarFleetProps> = ({
  searchTerm,
  onSearchChange,
  onReset,
  totalVehicles,
  filteredVehicles,
  selectedVehicle,
  onNavigatePrevious,
  onNavigateNext,
  canNavigatePrevious,
  canNavigateNext,
  onAddVehicle,
  onDeleteVehicle,
  modules,
  onToggleModule,
  onMoveModule,
  onToggleExpand,
  onToggleView,
  isTableView = false,
}) => {
  const [showModuleSettings, setShowModuleSettings] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);

  const handleModuleDrop = (index: number) => {
    if (dragIndex === null || dragIndex === index) return;
    onMoveModule(dragIndex, index);
    setDragIndex(null);
  };

  // Build fleet-specific left content (count + filter actions + navigation + expand)
  const leftContent = (
    <div className="toolbar-fleet__left-content">
      <span className="toolbar-fleet__count">
        {filteredVehicles} of {totalVehicles} vehicles
      </span>
      
      <div className="toolbar-fleet__separator" />
      
      <button 
        onClick={onReset}
        className="toolbar-fleet__action-btn"
        title="Reset filters"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 6h18M6 12h12M10 18h4"/>
        </svg>
      </button>
      
      <div className="toolbar-fleet__separator" />
      
      {/* Navigation arrows - only in detail view */}
      {!isTableView && (
        <>
          <button 
            onClick={onNavigatePrevious}
            className="toolbar-fleet__action-btn"
            title="Previous vehicle"
            disabled={!canNavigatePrevious}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>
          
          <button 
            onClick={onNavigateNext}
            className="toolbar-fleet__action-btn"
            title="Next vehicle"
            disabled={!canNavigateNext}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>
          
          <div className="toolbar-fleet__separator" />
        </>
      )}
      
      {/* Expand toggle */}
      {onToggleExpand && (
        <button 
          onClick={onToggleExpand}
          className="toolbar-fleet__action-btn"
          title="Expand to table view"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/>
          </svg>
          <span style={{ marginLeft: '4px', fontSize: '12px' }}>Expand</span>
        </button>
      )}
    </div>
  );

  // Build fleet-specific toolbar actions (right side)
  const actions: ToolbarAction[] = [];
  
  // View modes (Detail, Table, Map)
  actions.push({ 
    key: "view-detail", 
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h2m4 0h2a2 2 0 012 2v8a2 2 0 01-2 2h-2m-4-6h.01M12 12h.01M16 12h.01M12 16h.01M16 16h.01"/></svg>, 
    title: "Detail view", 
    onClick: () => onToggleView && onToggleView(),
    variant: !isTableView ? "active" : "default"
  });
  
  actions.push({ 
    key: "view-table", 
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 10h16M4 14h16M4 18h16"/></svg>, 
    title: "Table view", 
    onClick: () => onToggleView && onToggleView(),
    variant: isTableView ? "active" : "default"
  });
  
  // Map view (placeholder for future)
  actions.push({ 
    key: "view-map", 
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>, 
    title: "Map view", 
    onClick: () => {}, // TODO: implement map view
    disabled: true
  });
  
  // Separator in actions
  actions.push({ 
    key: "separator", 
    icon: <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-text-secondary)', opacity: 0.3 }} />, 
    title: "", 
    onClick: () => {}
  });
  
  // Module settings
  actions.push({ 
    key: "module-settings", 
    icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>, 
    title: "Module settings", 
    onClick: () => setShowModuleSettings(prev => !prev),
    variant: showModuleSettings ? "active" : "default"
  });
  
  // Delete vehicle (optional)
  if (onDeleteVehicle) {
    actions.push({ 
      key: "delete", 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>, 
      title: "Delete selected vehicle", 
      onClick: onDeleteVehicle, 
      disabled: !selectedVehicle,
      variant: "danger"
    });
  }
  
  // Add vehicle (optional)
  if (onAddVehicle) {
    actions.push({ 
      key: "add", 
      icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14"/></svg>, 
      title: "Add new vehicle", 
      onClick: onAddVehicle,
      variant: "primary"
    });
  }

  // Module settings dropdown content
  const moduleDropdownContent = (
    <div>
      <div style={{ padding: '16px', borderBottom: '1px solid var(--color-border-light)' }}>
        <h4 style={{ margin: '0 0 4px 0', fontSize: '16px', fontWeight: 600, color: 'var(--color-text)' }}>
          Module Settings
        </h4>
        <p style={{ margin: 0, fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Configure visible modules and their order
        </p>
      </div>
      
      <div style={{ maxHeight: '240px', overflowY: 'auto' }}>
        {modules.map((module, index) => (
          <div
            key={module.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '12px 16px',
              gap: '12px',
              cursor: 'move',
              transition: 'background-color 0.2s ease'
            }}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => handleModuleDrop(index)}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--hauler-gray-100)'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <span style={{ color: 'var(--color-text-secondary)', cursor: 'grab', display: 'flex', alignItems: 'center', justifyContent: 'center' }} title="Drag to reorder">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </span>
            <input
              type="checkbox"
              id={`module-${module.key}`}
              checked={module.visible}
              onChange={() => onToggleModule(module.key)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--hauler-primary)', cursor: 'pointer' }}
            />
            <label 
              htmlFor={`module-${module.key}`}
              style={{ flex: 1, fontSize: '14px', color: 'var(--color-text)', cursor: 'pointer', userSelect: 'none' }}
            >
              {module.label || module.key}
            </label>
          </div>
        ))}
      </div>
      
      <div style={{ 
        padding: '12px 16px', 
        borderTop: '1px solid var(--color-border-light)', 
        backgroundColor: 'var(--color-canvas-darker)' 
      }}>
        <small style={{ color: 'var(--color-text-secondary)', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          💡 Drag to change module order
        </small>
      </div>
    </div>
  );

  return (
    <Toolbar
      leftContent={leftContent}
      searchTerm={searchTerm}
      placeholder="Search..."
      onSearchChange={onSearchChange}
      actions={actions}
      className="toolbar-fleet"
      showSearch={true}
      showCount={false} // Using custom leftContent instead
      dropdownContent={moduleDropdownContent}
      showDropdown={showModuleSettings}
      onDropdownClose={() => setShowModuleSettings(false)}
    />
  );
};

export default ToolbarFleet;