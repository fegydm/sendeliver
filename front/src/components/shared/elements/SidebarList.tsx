// File: ./front/src/components/shared/elements/SidebarList.tsx

import React from "react";

// Definition of a column for the sidebar list
export interface Column<T> {
  key: string;
  header: string;
  renderCell: (item: T) => React.ReactNode;
}

interface FilterOption {
  name: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}

interface SidebarListProps<T extends object> {
  items: T[];
  columns: Column<T>[];
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters?: FilterOption[];
  onSelectItem: (item: T) => void;
  selectedKey?: string;
  getKey: (item: T) => string;
}
export function SidebarList<T extends object>({
  items,
  columns,
  searchTerm,
  onSearchChange,
  filters = [],
  onSelectItem,
  selectedKey,
  getKey
}: SidebarListProps<T>) {
  // Filter items by searchTerm
  const filtered = items.filter(item =>
    Object.values(item).some(val =>
      String(val).toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  return (
    <div className="sidebar-list">
      {/* Search box */}
      <input
        type="text"
        className="sidebar-search"
        placeholder="Search..."
        value={searchTerm}
        onChange={e => onSearchChange(e.target.value)}
      />

      {/* Optional filters dropdowns */}
      <div className="sidebar-filters">
        {filters.map(f => (
          <select key={f.name} value={f.value} onChange={e => f.onChange(e.target.value)}>
            <option value="">All {f.name}</option>
            {f.options.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        ))}
      </div>

      {/* List header */}
      <div className="sidebar-header">
        {columns.map(col => (
          <div key={col.key} className="sidebar-col-header">
            {col.header}
          </div>
        ))}
      </div>

      {/* List items */}
      <div className="sidebar-items">
        {filtered.map(item => {
          const key = getKey(item);
          return (
            <div
              key={key}
              className={`sidebar-item${selectedKey === key ? ' selected' : ''}`}
              onClick={() => onSelectItem(item)}
            >
              {columns.map(col => (
                <div key={col.key} className="sidebar-col-cell">
                  {col.renderCell(item)}
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
