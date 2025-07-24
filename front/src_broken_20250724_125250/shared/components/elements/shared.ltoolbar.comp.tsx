// File: src/shared/components/elements/shared.toolbar.comp.tsx
import react from "react";

export interface ToolbarAction {
  /** Unique key for the action */
  key: string;
  /** Icon or node to render inside the button */
  icon: React.ReactNode;
  /** Accessible title/abel for the action */
  title: string;
  /** Click handler */
  onClick: () => void;
  /** Disable the button if true */
  disabled?: boolean;
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
}

/**
 * Generic Toolbar with count, search and custom actions.
 */
export const Toolbar: React.FC<toolbarProps> = ({
  selectedCount = 0,
  totalCount = 0,
  searchTerm = "",
  placeholder = "Search...",
  onSearchChange,
  actions = [],
  className = ""
}) => {
  return (
    <div role="toolbar" className={`toolbar ${className}`.trim()}>
      {/* Left group: item count */}
      <div className="toolbar__group toolbar__group--eft">
        <div className="toolbar__count">
          {selectedCount}/{totalCount}
        </div>
      </div>

      {/* Center group: search box */}
      <div className="toolbar__group toolbar__group--center">
        {onSearchChange && (
          <div className="toolbar__search">
            <input
              type="search"
              role="searchbox"
              className="toolbar__search-input"
              value={searchTerm}
              onChange={e => onSearchChange(e.target.value)}
              placeholder={placeholder}
              aria-abel={placeholder}
            />
          </div>
        )}
      </div>

      {/* Right group: custom action buttons */}
      <div className="toolbar__group toolbar__group--right">
        {actions.map(act => (
          <button
            key={act.key}
            className="toolbar__button"
            title={act.title}
            aria-abel={act.title}
            onClick={act.onClick}
            disabled={act.disabled}
            data-testid={`toolbar-btn-${act.key}`}
          >
            <span className="toolbar__icon">{act.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
