// File: src/shared/components/elements/shared.lside-lfilter.comp.tsx
// Last change: Added optional custom rendering but default to simple cell values

import React, { useState } from "react";

export interface ColumnConfig<T> {
  key: string;
  label: string;
  filterFn: (item: T, term: string) => boolean;
}

export interface SideFilterProps<T extends { id: string }> {
  items: T[];
  columns: ColumnConfig<T>[];
  selectedId?: string;
  onSelect: (item: T) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  /** Optional custom renderer for each item row */
  renderItem?: (item: T, isActive: boolean) => React.ReactNode;
}

export function SideFilter<T extends { id: string }>({
  items,
  columns,
  selectedId,
  onSelect,
  searchTerm,
  onSearchChange,
  renderItem,
}: SideFilterProps<T>) {
  const [activeColumn, setActiveColumn] = useState(columns[0].key);
  const column = columns.find(c => c.key === activeColumn)!;

  const filtered = items.filter(item => column.filterFn(item, searchTerm));

  return (
    <aside className="side-filter">
      <div className="side-filter__controls">
        <select
          className="side-filter__select"
          value={activeColumn}
          onChange={e => setActiveColumn(e.target.value)}
        >
          {columns.map(col => (
            <option key={col.key} value={col.key}>
              {col.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          className="side-filter__search-input"
          placeholder={`Hľadať podľa ${column.label.toLowerCase()}...`}
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
          aria-label={`Hľadať podľa ${column.label}`}
        />
      </div>
      <ul className="side-filter__list">
        {filtered.map(item => {
          const isActive = item.id === selectedId;
          return (
            <li
              key={item.id}
              className={`side-filter__item${isActive ? ' side-filter__item--active' : ''}`}
              onClick={() => onSelect(item)}
            >
              {renderItem
                ? renderItem(item, isActive)
                : columns.map(col => (
                    <span key={col.key} className="side-filter__cell">
                      {String((item as any)[col.key])}
                    </span>
                  ))}
            </li>
          );
        })}
        {filtered.length === 0 && <li className="side-filter__empty">Žiadne výsledky</li>}
      </ul>
    </aside>
  );
}