// File: src/components/sections/content/results/result-table.component.tsx
// Last modified: March 26, 2025 - Implemented cascading filters and optimized performance

import { useState, useEffect, useRef, useMemo } from "react";
import "./result-table.css";
import DistanceFilter, { distanceColumn } from "./DistanceFilter";
import TypeFilter, { typeColumn } from "./TypeFilter";
import StatusFilter, { statusColumn } from "./StatusFilter";
import AvailabilityFilter, { availabilityColumn } from "./AvailabilityFilter";
import TransitFilter, { transitColumn } from "./TransitFilter";
import RatingFilter, { ratingColumn } from "./RatingFilter";
import ContactFilter, { contactColumn } from "./ContactFilter";

export interface SenderResultData {
  distance: number;
  type: string;
  status: string;
  availability: string;
  transit: string;
  rating?: number;
  contact: number;
  name_carrier?: string;
}

export interface ResultTableProps {
  type: "sender" | "hauler";
  data?: SenderResultData[];
  isLoading?: boolean;
  className?: string;
}

interface Column {
  label: string;
  key: keyof SenderResultData;
  ref: React.RefObject<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>;
  component: React.ForwardRefExoticComponent<any> & {
    renderCell: (row: SenderResultData) => React.ReactNode;
    filterFn: (data: SenderResultData[], selected: string) => SenderResultData[];
  };
}

// Generate placeholder data for loading state
const getPlaceholderAvailability = (): string => {
  const now = new Date();
  const availabilityTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return availabilityTime.toISOString();
};

const PLACEHOLDER_DATA: SenderResultData[] = [
  {
    distance: 48,
    type: "truck",
    status: "available",
    availability: getPlaceholderAvailability(),
    transit: "2,5",
    rating: 4.2,
    contact: 1,
    name_carrier: "OmegaTrans",
  },
];

const ResultTable: React.FC<ResultTableProps> = ({ 
  type, 
  data = [], 
  isLoading = false, 
  className = "" 
}) => {
  if (type !== "sender") {
    return (
      <div className={`result-table ${className}`}>
        <p>Hauler filtering not implemented.</p>
      </div>
    );
  }

  // Use placeholder data when loading or when no data is available
  const showPlaceholder = data.length === 0 || isLoading;
  const initialData = showPlaceholder ? PLACEHOLDER_DATA : data;

  // Create refs for all filter components
  const distanceFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const typeFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const statusFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const availabilityFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const transitFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const ratingFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const contactFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);

  // Define column configuration 
  const columns: Column[] = useMemo(
    () => [
      { ...distanceColumn, ref: distanceFilterRef, component: DistanceFilter },
      { ...typeColumn, ref: typeFilterRef, component: TypeFilter },
      { ...statusColumn, ref: statusFilterRef, component: StatusFilter },
      { ...availabilityColumn, ref: availabilityFilterRef, component: AvailabilityFilter },
      { ...transitColumn, ref: transitFilterRef, component: TransitFilter },
      { ...ratingColumn, ref: ratingFilterRef, component: RatingFilter },
      { ...contactColumn, ref: contactFilterRef, component: ContactFilter },
    ],
    []
  );

  // Initialize filter states for each column
  const [filterStates, setFilterStates] = useState<{
    [key: string]: { selected: string; sortDirection: "asc" | "desc" | "none"; isOpen: boolean };
  }>(() =>
    columns.reduce((acc, col) => {
      acc[col.key] = { selected: "all", sortDirection: "none", isOpen: false };
      return acc;
    }, {} as any)
  );

  // Calculate filtered and sorted data using useMemo for performance
  const filteredData = useMemo(() => {
    let result = [...initialData];
    
    // Apply all filters in sequence
    columns.forEach(col => {
      const state = filterStates[col.key];
      if (state?.selected && state.selected !== "all") {
        result = col.component.filterFn(result, state.selected);
      }
    });

    // Apply sorting if any column has a sort direction
    const sortedColumn = columns.find(col => filterStates[col.key]?.sortDirection !== "none");
    if (sortedColumn) {
      const sortKey = sortedColumn.key;
      const sortDirection = filterStates[sortKey].sortDirection;
      
      result.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        
        // Numeric sorting for numeric columns
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        
        // String sorting for string columns
        const aStr = String(aValue || '');
        const bStr = String(bValue || '');
        return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }

    return result;
  }, [initialData, columns, filterStates]);

  // Handle sorting when clicking a column header
  const handleSort = (key: string) => {
    setFilterStates(prev => {
      const current = prev[key];
      const newDirection =
        current.sortDirection === "asc" ? "desc" : current.sortDirection === "desc" ? "none" : "asc";
      return { ...prev, [key]: { ...current, sortDirection: newDirection } };
    });
  };

  // Toggle filter dropdown open/closed
  const handleToggle = (key: string) => {
    setFilterStates(prev => {
      // Close all other dropdowns
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        if (k !== key && updated[k].isOpen) {
          updated[k] = { ...updated[k], isOpen: false };
        }
      });
      // Toggle the clicked dropdown
      return { ...updated, [key]: { ...updated[key], isOpen: !updated[key].isOpen } };
    });
  };

  // Handle filter option selection
  const handleOptionSelect = (key: string, value: string) => {
    setFilterStates(prev => ({ ...prev, [key]: { ...prev[key], selected: value, isOpen: false } }));
  };

  // Reset all filters to default state
  const resetFilters = () => {
    columns.forEach(col => {
      if (col.ref.current) {
        col.ref.current.reset();
      }
    });
    
    setFilterStates(
      columns.reduce((acc, col) => {
        acc[col.key] = { selected: "all", sortDirection: "none", isOpen: false };
        return acc;
      }, {} as any)
    );
  };

  // Close all dropdowns when pressing Escape
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setFilterStates(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            if (updated[key].isOpen) updated[key].isOpen = false;
          });
          return updated;
        });
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Get names of columns with active filters for the summary
  const appliedFilters = columns
    .filter(col => filterStates[col.key]?.selected !== "all")
    .map(col => col.label);

  return (
    <div className={`result-table ${className}`}>
      <div className="result-table__filter-summary">
        <span>
          {appliedFilters.length > 0
            ? `Filtered by ${appliedFilters.length} column(s): ${appliedFilters.join(", ")}`
            : "No filter is applied"}
        </span>
        <button 
          className="result-table__reset-button" 
          onClick={resetFilters}
          disabled={appliedFilters.length === 0}
        >
          Reset Filters
        </button>
      </div>
      
      <table className="result-table__table">
        <colgroup>
          {columns.map(col => (
            <col key={col.key} className={`col-${col.key}`} />
          ))}
        </colgroup>
        
        <thead ref={headerRef} className="result-table__header">
          <tr className="result-table__header-row">
            {columns.map(col => (
              <th
                key={col.key}
                className={`result-table__header-cell ${
                  filterStates[col.key]?.selected !== "all" ? "result-table__header-cell--filtered" : ""
                } ${filterStates[col.key]?.isOpen ? "result-table__header-cell--open" : ""}`}
              >
                <div className="header-cell__content">
                  <col.component
                    data={initialData}
                    onFilter={() => {}} // Kept for compatibility with BaseFilter
                    ref={col.ref}
                    label={col.label}
                    selected={filterStates[col.key]?.selected || "all"}
                    sortDirection={filterStates[col.key]?.sortDirection || "none"}
                    isOpen={filterStates[col.key]?.isOpen || false}
                    onSortClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleSort(col.key);
                    }}
                    onToggleClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      handleToggle(col.key);
                    }}
                    onOptionSelect={(value: string) => handleOptionSelect(col.key, value)}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody className="result-table__body">
          {filteredData.length === 0 ? (
            <tr className="result-table__body-row">
              <td className="result-table__body-cell" colSpan={columns.length}>
                Your requirements do not match any record
              </td>
            </tr>
          ) : (
            filteredData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`result-table__body-row ${showPlaceholder ? "result-table__body-row--placeholder" : ""}`}
              >
                {columns.map(col => (
                  <td key={col.key} className="result-table__body-cell">
                    {col.component.renderCell(row)}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;