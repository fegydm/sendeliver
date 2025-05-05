// File: components/shared/elements/Toolbar.tsx
import React from "react";
import { Button } from "@/components/shared/ui/button.ui";
import { Input } from "@/components/shared/ui/input.ui";

export interface ToolbarProps {
  /** Number of selected items */
  selectedCount?: number;
  /** Total number of items */
  totalCount?: number;
  /** Reset filters callback */
  onReset?: () => void;
  /** Expand/toggle detail-table view callback */
  onToggleExpand?: () => void;
  /** Settings callback */
  onSettings?: () => void;
  /** Delete callback */
  onDelete?: () => void;
  /** Add item callback */
  onAdd?: () => void;
  /** Search term and handler */
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
}

/**
 * Generic Toolbar with predefined buttons and search using shared UI components
 */
export const Toolbar: React.FC<ToolbarProps> = ({
  selectedCount = 0,
  totalCount = 0,
  onReset,
  onToggleExpand,
  onSettings,
  onDelete,
  onAdd,
  searchTerm = "",
  onSearchChange,
}) => {
  return (
    <div className="toolbar flex items-center justify-between bg-white p-2 shadow">
      {/* Left group */}
      <div className="toolbar-left flex items-center space-x-2">
        <div className="font-medium">
          {selectedCount}/{totalCount}
        </div>
        {onReset && (
          <Button
            variant="ghost"
            size="icon"
            title="Show all"
            onClick={onReset}
          >
            📑
          </Button>
        )}
        {onToggleExpand && (
          <Button
            variant="ghost"
            size="icon"
            title="Expand"
            onClick={onToggleExpand}
          >
            ⤢
          </Button>
        )}
      </div>

      {/* Center: search input */}
      <div className="toolbar-center flex-1 px-4">
        {onSearchChange && (
          <Input
            variant="search"
            value={searchTerm}
            onChange={e => onSearchChange(e.target.value)}
            placeholder="Search..."
          />
        )}
      </div>

      {/* Right group */}
      <div className="toolbar-right flex items-center space-x-2">
        {onSettings && (
          <Button
            variant="ghost"
            size="icon"
            title="Settings"
            onClick={onSettings}
          >
            ⚙️
          </Button>
        )}
        {onDelete && (
          <Button
            variant="ghost"
            size="icon"
            title="Delete"
            onClick={onDelete}
          >
            🗑️
          </Button>
        )}
        {onAdd && (
          <Button
            variant="ghost"
            size="icon"
            title="Add"
            onClick={onAdd}
          >
            ＋
          </Button>
        )}
      </div>
    </div>
  );
};
