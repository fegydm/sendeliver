// File: front/src/shared/layouts/sidebar/sidebar.tsx
// Last change: Created universal sidebar layout component for consistent sidebar experience

import React, { ReactNode } from "react";
import "./sidebar.css";

export interface SidebarFilter {
  /** Unique key for the filter */
  key: string;
  /** Filter type */
  type: 'select' | 'input' | 'checkbox' | 'radio';
  /** Label for the filter */
  label?: string;
  /** Placeholder text for inputs */
  placeholder?: string;
  /** Options for select/radio/checkbox filters */
  options?: Array<{ value: string; label: string }> | undefined;
  /** Current value */
  value: string | string[];
  /** Change handler */
  onChange: (value: string | string[]) => void;
  /** Additional CSS class */
  className?: string;
}

export interface SidebarProps {
  /** Search configuration */
  searchTerm?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  showSearch?: boolean;
  
  /** Filters configuration */
  filters?: SidebarFilter[];
  showFilters?: boolean;
  
  /** Items to display */
  items: any[];
  selectedId?: string;
  onSelectItem: (item: any) => void;
  
  /** Item rendering */
  renderItem: (item: any, isSelected: boolean) => ReactNode;
  
  /** Loading and empty states */
  isLoading?: boolean;
  loadingMessage?: string;
  emptyMessage?: string;
  
  /** Customization */
  className?: string;
  headerContent?: ReactNode;
  footerContent?: ReactNode;
}

/**
 * Universal Sidebar Layout Component
 * Used across all apps (hauler, sender, broker) for consistent sidebar experience
 * Supports search, filters, item list with customizable rendering
 */
export const Sidebar: React.FC<SidebarProps> = ({
  searchTerm = "",
  searchPlaceholder = "Search...",
  onSearchChange,
  showSearch = true,
  filters = [],
  showFilters = true,
  items,
  selectedId,
  onSelectItem,
  renderItem,
  isLoading = false,
  loadingMessage = "Loading...",
  emptyMessage = "No items found",
  className = "",
  headerContent,
  footerContent,
}) => {
  const renderFilter = (filter: SidebarFilter) => {
    const baseClassName = `sidebar__filter sidebar__filter--${filter.type}`;
    const fullClassName = `${baseClassName} ${filter.className || ''}`.trim();
    
    switch (filter.type) {
      case 'input':
        return (
          <input
            key={filter.key}
            type="text"
            className={fullClassName}
            placeholder={filter.placeholder}
            value={filter.value as string}
            onChange={(e) => filter.onChange(e.target.value)}
          />
        );
        
      case 'select':
        return (
          <select
            key={filter.key}
            className={fullClassName}
            value={filter.value as string}
            onChange={(e) => filter.onChange(e.target.value)}
          >
            {filter.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
        
      case 'checkbox':
        return (
          <div key={filter.key} className={fullClassName}>
            {filter.label && (
              <label className="sidebar__filter-label">{filter.label}</label>
            )}
            {filter.options?.map((option) => (
              <label key={option.value} className="sidebar__checkbox-item">
                <input
                  type="checkbox"
                  value={option.value}
                  checked={(filter.value as string[]).includes(option.value)}
                  onChange={(e) => {
                    const currentValues = filter.value as string[];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    filter.onChange(newValues);
                  }}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );
        
      case 'radio':
        return (
          <div key={filter.key} className={fullClassName}>
            {filter.label && (
              <label className="sidebar__filter-label">{filter.label}</label>
            )}
            {filter.options?.map((option) => (
              <label key={option.value} className="sidebar__radio-item">
                <input
                  type="radio"
                  name={filter.key}
                  value={option.value}
                  checked={filter.value === option.value}
                  onChange={(e) => filter.onChange(e.target.value)}
                />
                <span>{option.label}</span>
              </label>
            ))}
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <aside className={`sidebar ${className}`.trim()}>
      {/* Optional header content */}
      {headerContent && (
        <div className="sidebar__header">
          {headerContent}
        </div>
      )}
      
      {/* Search section */}
      {showSearch && onSearchChange && (
        <div className="sidebar__search">
          <div className="sidebar__search-icon">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="M21 21l-4.35-4.35"/>
            </svg>
          </div>
          <input
            type="search"
            className="sidebar__search-input"
            placeholder={searchPlaceholder}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
          {searchTerm && (
            <button
              onClick={() => onSearchChange('')}
              className="sidebar__search-clear"
              title="Clear search"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          )}
        </div>
      )}

      {/* Filters section */}
      {showFilters && filters.length > 0 && (
        <div className="sidebar__filters">
          {filters.map(renderFilter)}
        </div>
      )}

      {/* Items list */}
      <div className="sidebar__content">
        {isLoading ? (
          <div className="sidebar__loading">{loadingMessage}</div>
        ) : items.length === 0 ? (
          <div className="sidebar__empty">{emptyMessage}</div>
        ) : (
          <div className="sidebar__items">
            {items.map((item) => {
              const isSelected = selectedId === item.id;
              return (
                <div
                  key={item.id}
                  className={`sidebar__item ${isSelected ? 'sidebar__item--selected' : ''}`}
                  onClick={() => onSelectItem(item)}
                >
                  {renderItem(item, isSelected)}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Optional footer content */}
      {footerContent && (
        <div className="sidebar__footer">
          {footerContent}
        </div>
      )}
    </aside>
  );
};

export default Sidebar;