// File: front/src/shared/layouts/toolbar/toolbar.tsx
// Last change: Enhanced to be truly universal with custom content slots and minimal required overrides

import React, { ReactNode } from "react";
import "./toolbar.css";

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
  variant?: 'default' | 'primary' | 'danger' | 'active';
}

export interface ToolbarProps {
  /** Number of selected items */
  selectedCount?: number;
  /** Total number of items */
  totalCount?: number;
  /** Custom text instead of count (e.g., "5 vehicles", "12 drivers") */
  countText?: string;
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
  /** Custom content for left section (overrides count if provided) */
  leftContent?: ReactNode;
  /** Custom content for center section (overrides search if provided) */
  centerContent?: ReactNode;
  /** Custom content for right section (appends to actions) */
  rightContent?: ReactNode;
  /** Custom dropdown content that appears below toolbar */
  dropdownContent?: ReactNode;
  /** Whether dropdown is visible */
  showDropdown?: boolean;
  /** Callback when dropdown should close */
  onDropdownClose?: () => void;
}

/**
 * Universal Toolbar Layout Component
 * Used across all apps (hauler, sender, broker) for consistent toolbar experience
 * Supports custom content slots, search functionality and action buttons
 */
export const Toolbar: React.FC<ToolbarProps> = ({
  selectedCount = 0,
  totalCount = 0,
  countText,
  searchTerm = "",
  placeholder = "Search...",
  onSearchChange,
  actions = [],
  className = "",
  showSearch = true,
  showCount = true,
  leftContent,
  centerContent,
  rightContent,
  dropdownContent,
  showDropdown = false,
  onDropdownClose,
}) => {
  const getButtonVariantClass = (variant?: string) => {
    switch (variant) {
      case 'primary': return 'toolbar__button--primary';
      case 'danger': return 'toolbar__button--danger';
      case 'active': return 'toolbar__button--active';
      default: return '';
    }
  };

  const handleSearchClear = () => {
    if (onSearchChange) {
      onSearchChange('');
    }
  };

  const renderLeftSection = () => {
    if (leftContent) return leftContent;
    
    if (showCount) {
      if (countText) {
        return (
          <div className="toolbar__count">
            <span className="toolbar__count-text">{countText}</span>
          </div>
        );
      }
      return (
        <div className="toolbar__count">
          <span className="toolbar__count-selected">{selectedCount}</span>
          <span className="toolbar__count-separator">/</span>
          <span className="toolbar__count-total">{totalCount}</span>
        </div>
      );
    }
    
    return null;
  };

  const renderCenterSection = () => {
    if (centerContent) return centerContent;
    
    if (showSearch && onSearchChange) {
      return (
        <div className="toolbar__search">
          <div className="toolbar__search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <input
            type="search"
            role="searchbox"
            className="toolbar__search-input"
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
          />
          {searchTerm && (
            <button
              onClick={handleSearchClear}
              className="toolbar__search-clear"
              title="Clear search"
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      );
    }
    
    return null;
  };

  return (
    <div className={`toolbar ${className}`.trim()}>
      <div role="toolbar" className="toolbar__main">
        {/* Left group */}
        <div className="toolbar__group toolbar__group--left">
          {renderLeftSection()}
        </div>

        {/* Center group */}
        <div className="toolbar__group toolbar__group--center">
          {renderCenterSection()}
        </div>

        {/* Right group */}
        <div className="toolbar__group toolbar__group--right">
          {/* Custom action buttons */}
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
          
          {/* Additional custom content */}
          {rightContent}
        </div>
      </div>

      {/* Dropdown content */}
      {showDropdown && dropdownContent && (
        <div 
          className="toolbar__dropdown"
          onMouseLeave={onDropdownClose}
        >
          {dropdownContent}
        </div>
      )}
    </div>
  );
};

export default Toolbar;