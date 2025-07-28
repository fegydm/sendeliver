// File: src/shared/layouts/toolbar/toolbar.tsx
// Last change: Moved from shared/elements to proper shared/layouts location with enhanced interface

import React from "react";
import "./toolbar.css"; // Import CSS file

export interface ToolbarAction {
  /** Unique key for the action */
  key: string;
  /** Icon or node to render inside the button */
  icon: React.ReactNode;
  /** Accessible title/label for the action */
  title: string;
  /** Click handler */
  onClick: () => void;
  /** Disable the button if true */
  disabled?: boolean;
  /** Button variant for styling */
  variant?: 'default' | 'primary' | 'danger';
}

export interface ToolbarProps {
  /** Number of selected items */
  selectedCount?: number;
  /** Total number of items */
  totalCount?: number;
  /** Current search term */
  searchTerm?: string;
  /** Placeholder for the search input */
  placeholder?: string;
  /** Callback when search term changes */
  onSearchChange?: (value: string) => void;
  /** Array of toolbar actions (buttons) */
  actions?: ToolbarAction[];
  /** Additional CSS class(es) for the toolbar container */
  className?: string;
  /** Show search input */
  showSearch?: boolean;
  /** Show item count */
  showCount?: boolean;
}

/**
 * Universal Toolbar Layout Component
 * Used across all apps (hauler, sender, broker) for consistent toolbar experience
 * Supports count display, search functionality and custom action buttons
 */
export const Toolbar: React.FC<ToolbarProps> = ({
  selectedCount = 0,
  totalCount = 0,
  searchTerm = "",
  placeholder = "Search...",
  onSearchChange,
  actions = [],
  className = "",
  showSearch = true,
  showCount = true
}) => {
  const getButtonVariantClass = (variant?: string) => {
    switch (variant) {
      case 'primary': return 'toolbar__button--primary';
      case 'danger': return 'toolbar__button--danger';
      default: return '';
    }
  };

  return (
    <div role="toolbar" className={`toolbar ${className}`.trim()}>
      {/* Left group: item count */}
      {showCount && (
        <div className="toolbar__group toolbar__group--left">
          <div className="toolbar__count">
            <span className="toolbar__count-selected">{selectedCount}</span>
            <span className="toolbar__count-separator">/</span>
            <span className="toolbar__count-total">{totalCount}</span>
          </div>
        </div>
      )}

      {/* Center group: search box */}
      {showSearch && onSearchChange && (
        <div className="toolbar__group toolbar__group--center">
          <div className="toolbar__search">
            <input
              type="search"
              role="searchbox"
              className="toolbar__search-input"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              placeholder={placeholder}
              aria-label={placeholder}
            />
            <div className="toolbar__search-icon">
              🔍
            </div>
          </div>
        </div>
      )}

      {/* Right group: custom action buttons */}
      <div className="toolbar__group toolbar__group--right">
        {actions.map(action => (
          <button
            key={action.key}
            className={`toolbar__button ${getButtonVariantClass(action.variant)}`.trim()}
            title={action.title}
            aria-label={action.title}
            onClick={action.onClick}
            disabled={action.disabled}
            data-testid={`toolbar-btn-${action.key}`}
          >
            <span className="toolbar__button-icon">{action.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default Toolbar;