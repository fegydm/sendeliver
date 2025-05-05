// File: components/shared/elements/Toolbar.tsx
import React from "react";

// Toolbar component with search, reset and view toggle buttons
interface ToolbarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onReset: () => void;
  isTableView: boolean;
  onToggleView: () => void;
}

export const Toolbar: React.FC<ToolbarProps> = ({ searchTerm, onSearchChange, onReset, isTableView, onToggleView }) => (
  <div className="toolbar">
    {/* Search input */}
    <input
      type="text"
      className="toolbar-search"
      placeholder="Search..."
      value={searchTerm}
      onChange={e => onSearchChange(e.target.value)}
    />

    {/* Reset filters button */}
    <button onClick={onReset} className="toolbar-button" title="Reset filters">
      Reset
    </button>

    {/* Toggle between detail/table view */}
    <button onClick={onToggleView} className="toolbar-button" title="Toggle view">
      {isTableView ? 'Detail' : 'Table'}
    </button>
  </div>
);