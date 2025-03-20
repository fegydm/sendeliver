// File: ./front/src/components/sections/content/results/result-table.component.tsx
// Last change: Fixed type issues and added labeled logging for better debug filtering

import { useState, useEffect, useRef, useMemo } from "react";
import "./result-table.css";
import DistanceFilter, { distanceColumn } from "./DistanceFilter";
import TypeFilter, { typeColumn } from "./TypeFilter";
import StatusFilter, { statusColumn } from "./StatusFilter";
import AvailabilityFilter, { availabilityColumn } from "./AvailabilityFilter";
import TransitFilter, { transitColumn } from "./TransitFilter";
import RatingFilter, { ratingColumn } from "./RatingFilter";
import ContactFilter, { contactColumn } from "./ContactFilter";
import { DELIVERY_CONSTANTS } from "back/constants/vehicle.constants";

export interface SenderResultData {
  distance: number;
  type: string;
  status: string;
  availability_date: string;
  availability_time: string;
  transit: string;
  rating?: number;
  id_pp: number;
  name_carrier?: string;
}

export interface ResultTableProps {
  type: "sender" | "hauler";
  data?: SenderResultData[];
  isLoading?: boolean;
  className?: string;
  totalCount?: number;
  loadingDt?: string;
  isConfirmed?: boolean; // New prop to control whether transport request is confirmed
}

// Modified to allow string keys in addition to SenderResultData keys
interface Column {
  label: string;
  key: string; // Changed from 'keyof SenderResultData' to 'string'
  ref: React.RefObject<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>;
  component: React.ForwardRefExoticComponent<any> & {
    renderCell: (row: SenderResultData, loadingDt?: string) => React.ReactNode;
    filterFn: (data: SenderResultData[], selected: string, loadingDt?: string) => SenderResultData[];
  };
  loadingDt?: string;
  width?: number;
  minWidth?: number;
  cssClass?: string;
}

// Generate placeholder availability time (current time + 2 hours)
const getPlaceholderAvailability = () => {
  const now = new Date();
  const availabilityTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  return {
    date: availabilityTime.toISOString().split("T")[0],
    time: `${availabilityTime.getHours().toString().padStart(2, "0")}:${availabilityTime.getMinutes().toString().padStart(2, "0")}:00`,
  };
};

// Sample placeholder data to show before real data is available
const PLACEHOLDER_DATA: SenderResultData[] = [
  {
    distance: 48,
    type: "truck",
    status: "available",
    availability_date: getPlaceholderAvailability().date,
    availability_time: getPlaceholderAvailability().time,
    transit: "2,5",
    rating: 4.2,
    id_pp: 1045789,
    name_carrier: "OmegaTrans",
  },
];

const ResultTable: React.FC<ResultTableProps> = ({
  type,
  data = [],
  isLoading = false,
  className = "",
  totalCount = 0,
  loadingDt,
  isConfirmed = false, // Default to not confirmed
}) => {
  // Generate unique instance ID for debugging
  const instanceId = useMemo(() => Math.random().toString(36).substr(2, 9), []);
  
  // Add initial log for component mounting
  console.log(`[SENDELIVER_TABLE] Component initialized with:`, {
    instanceId,
    type,
    dataLength: data.length,
    dataItems: data,
    isLoading,
    totalCount,
    loadingDt,
    isConfirmed,
  });

  // Early return for hauler type (not implemented)
  if (type !== "sender") {
    console.log(`[SENDELIVER_TABLE] Early return - hauler type not implemented`, { instanceId });
    return <div className={`result-table ${className}`}><p>Hauler filtering not implemented.</p></div>;
  }

  // Show loading state
  if (isLoading) {
    console.log(`[SENDELIVER_TABLE] Showing loading state`, { instanceId });
    return <div className={`result-table ${className}`}><p>Loading...</p></div>;
  }

  // Show placeholders only if there's no data and the transport request is not confirmed
  const shouldShowPlaceholders = data.length === 0 && !isConfirmed;
  const initialData = shouldShowPlaceholders ? PLACEHOLDER_DATA : data;
  
  console.log(`[SENDELIVER_TABLE] Placeholders logic:`, {
    instanceId,
    shouldShowPlaceholders,
    dataLength: data.length,
    isConfirmed,
    initialDataLength: initialData.length,
    initialData: initialData,
  });

  // References for filter components
  const distanceFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const typeFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const statusFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const availabilityFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const transitFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const ratingFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const contactFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State for column widths and resizing
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});
  const [isResizing, setIsResizing] = useState<string | null>(null);

  // Define columns with their properties
  const columns: Column[] = useMemo(
    () => {
      const cols = [
        { ...distanceColumn, ref: distanceFilterRef, component: DistanceFilter, width: 100, minWidth: 30, cssClass: "result-table__col--distance" },
        { ...typeColumn, ref: typeFilterRef, component: TypeFilter, width: 100, minWidth: 30, cssClass: "result-table__col--type" },
        { ...statusColumn, ref: statusFilterRef, component: StatusFilter, loadingDt, width: 200, minWidth: 30, cssClass: "result-table__col--status" },
        { ...availabilityColumn, key: "availability_date", ref: availabilityFilterRef, component: AvailabilityFilter, width: 120, minWidth: 30, cssClass: "result-table__col--availability" },
        { ...transitColumn, ref: transitFilterRef, component: TransitFilter, width: 80, minWidth: 30, cssClass: "result-table__col--transit" },
        { ...ratingColumn, ref: ratingFilterRef, component: RatingFilter, width: 100, minWidth: 30, cssClass: "result-table__col--rating" },
        { ...contactColumn, ref: contactFilterRef, component: ContactFilter, width: 100, minWidth: 30, cssClass: "result-table__col--contact" },
      ];
      console.log(`[SENDELIVER_TABLE] Columns initialized:`, { 
        instanceId,
        columnCount: cols.length,
        columns: cols.map(c => c.key)
      });
      return cols;
    },
    [loadingDt, instanceId]
  );

  // Initialize filter states for all columns
  const [filterStates, setFilterStates] = useState<{
    [key: string]: { selected: string; sortDirection: "asc" | "desc" | "none"; isOpen: boolean };
  }>(() => {
    const states = columns.reduce((acc, col) => {
      acc[col.key] = { selected: "all", sortDirection: "none", isOpen: false };
      return acc;
    }, {} as any);
    console.log(`[SENDELIVER_TABLE] Filter states initialized:`, { instanceId, states });
    return states;
  });

  // Initialize column widths on component mount
  useEffect(() => {
    const initialWidths: { [key: string]: number } = {};
    columns.forEach(col => {
      initialWidths[col.key] = col.width || 100;
    });
    console.log(`[SENDELIVER_TABLE] Column widths initialized:`, { instanceId, initialWidths });
    setColumnWidths(initialWidths);
  }, [columns, instanceId]);

  // Calculate filtered and sorted data based on filter states
  const filteredData = useMemo(() => {
    console.log(`[SENDELIVER_TABLE] Calculating filtered data from:`, {
      instanceId,
      initialDataLength: initialData.length,
      filterStates
    });
    
    let result = [...initialData];
    
    // Apply all active filters
    columns.forEach(col => {
      const state = filterStates[col.key];
      if (state?.selected && state.selected !== "all") {
        console.log(`[SENDELIVER_TABLE] Applying filter for column ${col.key}:`, {
          instanceId,
          selected: state.selected,
          beforeFilter: result.length
        });
        
        result = col.component.filterFn(result, state.selected, col.loadingDt);
        
        console.log(`[SENDELIVER_TABLE] After filtering ${col.key}:`, {
          instanceId,
          remainingItems: result.length
        });
      }
    });
    
    // Apply sorting if any column has active sort direction
    const sortedColumn = columns.find(col => filterStates[col.key]?.sortDirection !== "none");
    if (sortedColumn) {
      const sortKey = sortedColumn.key;
      const sortDirection = filterStates[sortKey].sortDirection;
      
      console.log(`[SENDELIVER_TABLE] Sorting by column ${sortKey}:`, {
        instanceId,
        direction: sortDirection
      });
      
      result.sort((a, b) => {
        const aValue = a[sortKey as keyof SenderResultData];
        const bValue = b[sortKey as keyof SenderResultData];
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        const aStr = String(aValue || "");
        const bStr = String(bValue || "");
        return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }
    
    console.log(`[SENDELIVER_TABLE] Final filtered data:`, {
      instanceId,
      itemCount: result.length,
      firstFewItems: result.slice(0, 2)
    });
    
    return result;
  }, [initialData, columns, filterStates, instanceId]);

  // Handle column sorting (cycles between asc, desc, none)
  const handleSort = (key: string) => {
    console.log(`[SENDELIVER_TABLE] Sorting column ${key}`, { instanceId });
    setFilterStates(prev => {
      const current = prev[key];
      const newDirection =
        current.sortDirection === "asc" ? "desc" : current.sortDirection === "desc" ? "none" : "asc";
      console.log(`[SENDELIVER_TABLE] Changed sort direction for ${key}:`, {
        instanceId,
        from: current.sortDirection,
        to: newDirection
      });
      return { ...prev, [key]: { ...current, sortDirection: newDirection } };
    });
  };

  // Handle filter dropdown toggle - close other open dropdowns
  const handleToggle = (key: string) => {
    console.log(`[SENDELIVER_TABLE] Toggling dropdown for column ${key}`, { instanceId });
    setFilterStates(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        if (k !== key && updated[k].isOpen) {
          console.log(`[SENDELIVER_TABLE] Closing dropdown for column ${k}`, { instanceId });
          updated[k] = { ...updated[k], isOpen: false };
        }
      });
      const newOpen = !updated[key].isOpen;
      console.log(`[SENDELIVER_TABLE] Setting dropdown for ${key} to ${newOpen ? 'open' : 'closed'}`, { instanceId });
      return { ...updated, [key]: { ...updated[key], isOpen: newOpen } };
    });
  };

  // Handle filter option selection
  const handleOptionSelect = (key: string, value: string) => {
    console.log(`[SENDELIVER_TABLE] Selected filter option for ${key}:`, { instanceId, value });
    setFilterStates(prev => ({ ...prev, [key]: { ...prev[key], selected: value, isOpen: false } }));
  };

  // Reset all filters and sorting
  const resetFilters = () => {
    console.log(`[SENDELIVER_TABLE] Resetting all filters`, { instanceId });
    columns.forEach(col => {
      if (col.ref.current) col.ref.current.reset();
    });
    setFilterStates(
      columns.reduce((acc, col) => {
        acc[col.key] = { selected: "all", sortDirection: "none", isOpen: false };
        return acc;
      }, {} as any)
    );
  };

  // Handle column resize start
  const handleResizeStart = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    console.log(`[SENDELIVER_TABLE] Starting resize for column ${key}`, { instanceId });
    setIsResizing(key);
    const initialPos = {
      clientX: e.clientX,
      width: columnWidths[key] || columns.find(col => col.key === key)?.width || 100,
    };
  
    const colElement = tableRef.current?.querySelector(`col[data-key="${key}"]`) as HTMLTableColElement | null;
    if (!colElement) {
      console.error(`[SENDELIVER_TABLE] Could not find column element for ${key}`, { instanceId });
      return;
    }
  
    // Handle mouse movement during resize
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - initialPos.clientX;
      // Constrain width between min (30px) and max (120px)
      const newWidth = Math.min(120, Math.max(30, initialPos.width + delta));
      colElement.style.width = `${newWidth}px`;
    };
  
    // Handle resize end
    const handleMouseUp = () => {
      const finalWidth = parseFloat(colElement.style.width || "0");
      console.log(`[SENDELIVER_TABLE] Finished resize for column ${key}:`, {
        instanceId,
        newWidth: finalWidth
      });
      setColumnWidths(prev => ({ ...prev, [key]: finalWidth }));
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      setIsResizing(null);
    };
  
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  // Double-click to auto-size column to content
  const handleDoubleClick = (key: string) => {
    console.log(`[SENDELIVER_TABLE] Auto-sizing column ${key}`, { instanceId });
    if (tableRef.current) {
      const cells = tableRef.current.querySelectorAll(`td.result-table__body-cell:nth-child(${columns.findIndex(col => col.key === key) + 1})`);
      console.log(`[SENDELIVER_TABLE] Found ${cells.length} cells for column ${key}`, { instanceId });
      
      let maxWidth = 30;
      cells.forEach(cell => {
        const cellWidth = cell.scrollWidth;
        maxWidth = Math.max(maxWidth, Math.min(cellWidth, 120));
      });
      
      console.log(`[SENDELIVER_TABLE] Auto-sized width for column ${key}:`, { instanceId, maxWidth });
      setColumnWidths(prev => ({ ...prev, [key]: maxWidth }));
    } else {
      console.error(`[SENDELIVER_TABLE] Table ref not available for auto-sizing`, { instanceId });
    }
  };

  // Close filter dropdowns on escape key press
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        console.log(`[SENDELIVER_TABLE] Escape key pressed, closing all dropdowns`, { instanceId });
        setFilterStates(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            if (updated[key].isOpen) {
              updated[key] = { ...updated[key], isOpen: false };
            }
          });
          return updated;
        });
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [instanceId]);

  // Get list of columns that have filters applied
  const appliedFilters = columns
    .filter(col => filterStates[col.key]?.selected !== "all")
    .map(col => col.label);
  
  console.log(`[SENDELIVER_TABLE] Applied filters:`, {
    instanceId,
    count: appliedFilters.length,
    filters: appliedFilters
  });

  // Log render metrics before returning JSX
  console.log(`[SENDELIVER_TABLE] Rendering table with:`, {
    instanceId,
    filteredDataLength: filteredData.length,
    shouldShowPlaceholders,
    className,
    isConfirmed
  });

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
      <div className="result-table__scroll-container" ref={scrollContainerRef}>
        <table className="result-table__table" ref={tableRef}>
          <colgroup>
            {columns.map(col => (
              <col
                key={col.key}
                data-key={col.key}
                className={col.cssClass}
                style={{ width: `${columnWidths[col.key] || col.width || 100}px` }}
              />
            ))}
          </colgroup>
          <thead className="result-table__header">
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
                      onFilter={() => {}}
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
                      loadingDt={col.loadingDt}
                    />
                    <div
                      className={`result-table__resizer ${isResizing === col.key ? "result-table__resizer--active" : ""}`}
                      onMouseDown={(e) => handleResizeStart(col.key, e)}
                      onDoubleClick={() => handleDoubleClick(col.key)}
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
                  className={`result-table__body-row ${shouldShowPlaceholders ? "result-table__body-row--placeholder" : ""}`}
                >
                  {columns.map(col => (
                    <td key={col.key} className="result-table__body-cell">
                      {col.component.renderCell(row, col.loadingDt)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="result-table__footer">
            <tr>
              <td colSpan={columns.length} className="result-table__footer-cell">
                <div className="result-table__footer-content">
                  <div className="result-table__stats">
                    <span className="result-table__stat-item">
                      Showing <strong>{filteredData.length}</strong> of <strong>{initialData.length}</strong> matching vehicles
                    </span>
                    {totalCount > 0 && (
                      <span className="result-table__stat-item total-deliveries">
                        Total deliveries in last {DELIVERY_CONSTANTS.MAX_PAST_TIME_HOURS}h: <strong>{totalCount}</strong>
                      </span>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

export default ResultTable;