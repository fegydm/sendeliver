// File: ./front/src/components/sections/content/results/result-table.component.tsx
// Last change: Added complete hauler support with CARGO_MOCK_DATA and BEM classes

import { useState, useEffect, useRef, useMemo } from "react";
import "./result-table.component.css";
import DistanceFilter, { distanceColumn } from "./DistanceFilter";
import TypeFilter, { typeColumn } from "./TypeFilter";
import StatusFilter, { statusColumn } from "./StatusFilter";
import AvailabilityFilter, { availabilityColumn } from "./AvailabilityFilter";
import TransitFilter, { transitColumn } from "./TransitFilter";
import RatingFilter, { ratingColumn } from "./RatingFilter";
import ContactFilter, { contactColumn } from "./ContactFilter";
import { DELIVERY_CONSTANTS } from "@shared/constants/vehicle.constants";
import { CARGO_MOCK_DATA, CargoResultData } from "@/data/mockCargoData";

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

// Union type for both data types
export type ResultData = SenderResultData | CargoResultData;

export interface ResultTableProps {
  type: "sender" | "hauler";
  data?: SenderResultData[];
  isLoading?: boolean;
  className?: string;
  totalCount?: number;
  loadingDt?: string;
  isConfirmed?: boolean;
}

interface Column {
  label: string;
  key: string;
  ref?: React.RefObject<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>;
  component?: React.ForwardRefExoticComponent<any> & {
    renderCell: (row: SenderResultData, loadingDt?: string) => React.ReactNode;
    filterFn: (data: SenderResultData[], selected: string, loadingDt?: string) => SenderResultData[];
  };
  renderCell?: (row: any) => React.ReactNode; // Changed from ResultData to any
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
  isConfirmed = false,
}) => {
  // Generate unique instance ID for debugging
  const instanceId = useMemo(() => Math.random().toString(36).substr(2, 9), []);
  
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

  // Show loading state
  if (isLoading) {
    console.log(`[SENDELIVER_TABLE] Showing loading state`, { instanceId });
    return <div className={`result-table result-table--${type} ${className}`}><p>Loading...</p></div>;
  }

  // Determine data source based on type
  const sourceData = type === "sender" ? data : CARGO_MOCK_DATA;
  const shouldShowPlaceholders = sourceData.length === 0 && !isConfirmed;
  const initialData = shouldShowPlaceholders 
    ? (type === "sender" ? PLACEHOLDER_DATA : CARGO_MOCK_DATA.slice(0, 3))
    : sourceData;
  
  console.log(`[SENDELIVER_TABLE] Data processing:`, {
    instanceId,
    type,
    shouldShowPlaceholders,
    sourceDataLength: sourceData.length,
    initialDataLength: initialData.length,
  });

  // References for filter components (sender only)
  const distanceFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const typeFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const statusFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const availabilityFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const transitFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const ratingFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const contactFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resultTableRef = useRef<HTMLDivElement>(null);
  const dropdownContainerRef = useRef<HTMLDivElement>(null);

  // State for column widths and resizing
  const [columnWidths, setColumnWidths] = useState<{ [key: string]: number }>({});
  const [isResizing, setIsResizing] = useState<string | null>(null);
  
  // References for scroll handling
  const prevScrollYRef = useRef<number>(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Define columns based on type
  const columns: Column[] = useMemo(() => {
    if (type === "hauler") {
      // Hauler columns for cargo data
      const haulerColumns: Column[] = [
        {
          label: "Route",
          key: "pickup",
          cssClass: "result-table__header-cell--route",
          width: 200,
          minWidth: 150,
          renderCell: (row: CargoResultData) => (
            <div className="result-table__body-cell--route">
              {`${row.pickup} → ${row.destination}`}
            </div>
          ),
        },
        {
          label: "Cargo",
          key: "cargoType", 
          cssClass: "result-table__header-cell--cargo",
          width: 180,
          minWidth: 120,
          renderCell: (row: CargoResultData) => (
            <div className="result-table__body-cell--cargo">
              {`${row.cargoType} (${row.weight}kg)`}
            </div>
          ),
        },
        {
          label: "Price",
          key: "price",
          cssClass: "result-table__header-cell--price", 
          width: 100,
          minWidth: 80,
          renderCell: (row: CargoResultData) => (
            <div className="result-table__body-cell--price">
              €{row.price}
            </div>
          ),
        },
        {
          label: "Distance",
          key: "distance",
          cssClass: "result-table__header-cell--distance",
          width: 100,
          minWidth: 80,
          renderCell: (row: CargoResultData) => (
            <div className="result-table__body-cell--distance">
              {row.distance}km
            </div>
          ),
        },
        {
          label: "Status",
          key: "status",
          cssClass: "result-table__header-cell--status",
          width: 120,
          minWidth: 100,
          renderCell: (row: CargoResultData) => (
            <div className="result-table__body-cell--status">
              <span className={`result-table__status-badge result-table__status-badge--${row.status}`}>
                {row.status === 'available' ? '🟢 Available' : 
                 row.status === 'urgent' ? '🔴 Urgent' : 
                 '🟡 Bidding'}
              </span>
            </div>
          ),
        },
        {
          label: "Client",
          key: "client",
          cssClass: "result-table__header-cell--client",
          width: 150,
          minWidth: 120,
          renderCell: (row: CargoResultData) => (
            <div className="result-table__body-cell--client">
              {row.client}
            </div>
          ),
        },
        {
          label: "Posted",
          key: "postedTime",
          cssClass: "result-table__header-cell--posted",
          width: 90,
          minWidth: 70,
          renderCell: (row: CargoResultData) => (
            <div className="result-table__body-cell--posted">
              {row.postedTime}
            </div>
          ),
        },
      ];
      
      console.log(`[SENDELIVER_TABLE] Hauler columns initialized:`, { 
        instanceId,
        columnCount: haulerColumns.length,
        columns: haulerColumns.map(c => c.key)
      });
      
      return haulerColumns;
    }
    
    // Sender columns (original with BEM classes)
    const senderColumns = [
      { 
        ...distanceColumn, 
        ref: distanceFilterRef, 
        component: DistanceFilter, 
        width: 100, 
        minWidth: 30, 
        cssClass: "result-table__header-cell--distance" 
      },
      { 
        ...typeColumn, 
        ref: typeFilterRef, 
        component: TypeFilter, 
        width: 100, 
        minWidth: 30, 
        cssClass: "result-table__header-cell--type" 
      },
      { 
        ...statusColumn, 
        ref: statusFilterRef, 
        component: StatusFilter, 
        loadingDt, 
        width: 200, 
        minWidth: 30, 
        cssClass: "result-table__header-cell--status" 
      },
      { 
        ...availabilityColumn, 
        key: "availability_date", 
        ref: availabilityFilterRef, 
        component: AvailabilityFilter, 
        width: 120, 
        minWidth: 30, 
        cssClass: "result-table__header-cell--availability" 
      },
      { 
        ...transitColumn, 
        ref: transitFilterRef, 
        component: TransitFilter, 
        width: 80, 
        minWidth: 30, 
        cssClass: "result-table__header-cell--transit" 
      },
      { 
        ...ratingColumn, 
        ref: ratingFilterRef, 
        component: RatingFilter, 
        width: 100, 
        minWidth: 30, 
        cssClass: "result-table__header-cell--rating" 
      },
      { 
        ...contactColumn, 
        ref: contactFilterRef, 
        component: ContactFilter, 
        width: 100, 
        minWidth: 30, 
        cssClass: "result-table__header-cell--contact" 
      },
    ];
    
    console.log(`[SENDELIVER_TABLE] Sender columns initialized:`, { 
      instanceId,
      columnCount: senderColumns.length,
      columns: senderColumns.map(c => c.key)
    });
    
    return senderColumns;
  }, [loadingDt, instanceId, type]);

  // Initialize filter states for sender columns only
  const [filterStates, setFilterStates] = useState<{
    [key: string]: { selected: string; sortDirection: "asc" | "desc" | "none"; isOpen: boolean };
  }>(() => {
    if (type === "hauler") {
      return {}; // No filters for hauler initially
    }
    
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

  // Calculate filtered and sorted data (sender only)
  const filteredData = useMemo(() => {
    if (type === "hauler") {
      // For hauler, return data as-is (no filtering yet)
      console.log(`[SENDELIVER_TABLE] Hauler data (no filtering):`, {
        instanceId,
        itemCount: initialData.length
      });
      return initialData;
    }
    
    console.log(`[SENDELIVER_TABLE] Calculating filtered sender data:`, {
      instanceId,
      initialDataLength: initialData.length,
      filterStates
    });
    
    let result = [...initialData] as SenderResultData[];
    
    // Apply all active filters for sender
    columns.forEach(col => {
      if (!col.component) return; // Skip hauler columns without filters
      
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
  }, [initialData, columns, filterStates, instanceId, type]);

  // Scroll position handling (sender only) 
  useEffect(() => {
    if (type === "hauler") return;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    prevScrollYRef.current = window.scrollY;
    console.log(`[SCROLL_SIMPLE] Captured scroll position: ${prevScrollYRef.current}`);
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [filterStates, type]);

  useEffect(() => {
    if (type === "hauler") return;
    
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }
    
    scrollTimeoutRef.current = setTimeout(() => {
      console.log(`[SCROLL_SIMPLE] Restoring scroll position: ${prevScrollYRef.current}`);
      window.scrollTo({
        top: prevScrollYRef.current,
        behavior: 'auto'
      });
    }, 50);
    
    return () => {
      if (scrollTimeoutRef.current) {
        clearTimeout(scrollTimeoutRef.current);
      }
    };
  }, [filteredData, type]);

  // Filter handlers (sender only)
  const handleSort = (key: string) => {
    if (type === "hauler") return; // No sorting for hauler yet
    
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

  const handleToggle = (key: string) => {
    if (type === "hauler") return; // No dropdowns for hauler yet
    
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

  const handleOptionSelect = (key: string, value: string) => {
    if (type === "hauler") return; // No filtering for hauler yet
    
    console.log(`[SENDELIVER_TABLE] Selected filter option for ${key}:`, { instanceId, value });
    setFilterStates(prev => ({ ...prev, [key]: { ...prev[key], selected: value, isOpen: false } }));
  };

  const resetFilters = () => {
    if (type === "hauler") return; // No filters for hauler yet
    
    console.log(`[SENDELIVER_TABLE] Resetting all filters`, { instanceId });
    columns.forEach(col => {
      if (col.ref?.current) col.ref.current.reset();
    });
    setFilterStates(
      columns.reduce((acc, col) => {
        acc[col.key] = { selected: "all", sortDirection: "none", isOpen: false };
        return acc;
      }, {} as any)
    );
  };

  // Column resizing handlers (both types)
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
  
    const handleMouseMove = (e: MouseEvent) => {
      const delta = e.clientX - initialPos.clientX;
      const newWidth = Math.min(120, Math.max(30, initialPos.width + delta));
      colElement.style.width = `${newWidth}px`;
    };
  
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

  const handleDoubleClick = (key: string) => {
    console.log(`[SENDELIVER_TABLE] Auto-sizing column ${key}`, { instanceId });
    if (tableRef.current) {
      const headerCells = tableRef.current.querySelectorAll(`th.result-table__header-cell:nth-child(${columns.findIndex(col => col.key === key) + 1})`);
      const cells = tableRef.current.querySelectorAll(`td.result-table__body-cell:nth-child(${columns.findIndex(col => col.key === key) + 1})`);
      
      let maxWidth = 30;
      
      headerCells.forEach(cell => {
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.whiteSpace = 'nowrap';
        tempDiv.style.padding = '2px';
        tempDiv.innerHTML = cell.innerHTML;
        document.body.appendChild(tempDiv);
        
        const headerWidth = tempDiv.offsetWidth + 10;
        maxWidth = Math.max(maxWidth, headerWidth);
        
        document.body.removeChild(tempDiv);
      });
      
      cells.forEach(cell => {
        const cellContent = cell.textContent || '';
        const tempSpan = document.createElement('span');
        tempSpan.style.position = 'absolute';
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.whiteSpace = 'nowrap';
        tempSpan.style.padding = '2px';
        tempSpan.textContent = cellContent;
        document.body.appendChild(tempSpan);
        
        const cellWidth = tempSpan.offsetWidth + 8;
        maxWidth = Math.max(maxWidth, cellWidth);
        
        document.body.removeChild(tempSpan);
      });
      
      maxWidth = Math.min(maxWidth, 200);
      
      const colElement = tableRef.current.querySelector(`col[data-key="${key}"]`) as HTMLTableColElement | null;
      if (colElement) {
        colElement.style.width = `${maxWidth}px`;
        setColumnWidths(prev => ({ ...prev, [key]: maxWidth }));
      }
    }
  };

  // Get applied filters (sender only)
  const appliedFilters = type === "sender" 
    ? columns
        .filter(col => filterStates[col.key]?.selected !== "all")
        .map(col => col.label)
    : [];
  
  console.log(`[SENDELIVER_TABLE] Applied filters:`, {
    instanceId,
    type,
    count: appliedFilters.length,
    filters: appliedFilters
  });

  console.log(`[SENDELIVER_TABLE] Rendering table with:`, {
    instanceId,
    type,
    filteredDataLength: filteredData.length,
    shouldShowPlaceholders,
    className,
    isConfirmed
  });

  return (
    <div className={`result-table result-table--${type} ${className}`} ref={resultTableRef}>
      {/* Dropdown container - only for sender */}
      {type === "sender" && (
        <div 
          id="result-table-dropdown-container" 
          ref={dropdownContainerRef}
          className="result-table__dropdown-container"
          style={{ position: 'relative', zIndex: 3000 }}
        />
      )}
      
      {/* Filter summary - only for sender */}
      {type === "sender" && (
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
      )}

      <div className="result-table__scroll-container" ref={scrollContainerRef}>
        <table className="result-table__table" ref={tableRef} style={{ tableLayout: "fixed" }}>
          <colgroup>
            {columns.map(col => (
              <col
                key={col.key}
                data-key={col.key}
                className={col.cssClass}
              />
            ))}
          </colgroup>
          <thead className="result-table__header">
            <tr className="result-table__header-row">
              {columns.map(col => (
                <th
                  key={col.key}
                  className={`result-table__header-cell ${col.cssClass || ''} ${
                    type === "sender" && filterStates[col.key]?.selected !== "all" ? "result-table__header-cell--filtered" : ""
                  } ${type === "sender" && filterStates[col.key]?.isOpen ? "result-table__header-cell--open" : ""}`}
                >
                  <div className="result-table__header-content">
                    {/* Render filter component for sender, simple label for hauler */}
                    {type === "sender" && col.component ? (
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
                    ) : (
                      <div className="result-table__header-label">
                        {col.label}
                      </div>
                    )}
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
              <tr className="result-table__body-row result-table__body-row--empty">
                <td className="result-table__body-cell" colSpan={columns.length}>
                  {type === "sender" 
                    ? "Your requirements do not match any record"
                    : "No cargo available"
                  }
                </td>
              </tr>
            ) : (
              filteredData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={`result-table__body-row ${shouldShowPlaceholders ? "result-table__body-row--placeholder" : ""}`}
                >
                  {columns.map(col => (
                    <td key={col.key} className={`result-table__body-cell ${col.cssClass?.replace('header-cell', 'body-cell') || ''}`}>
                      {type === "sender" && col.component
                        ? col.component.renderCell(row as SenderResultData, col.loadingDt)
                        : col.renderCell?.(row)
                      }
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
                  <div className="result-table__footer-stats">
                    <span className="result-table__footer-stat-item">
                      Showing <strong>{filteredData.length}</strong> of <strong>{initialData.length}</strong> {
                        type === "sender" ? "matching vehicles" : "available cargo jobs"
                      }
                    </span>
                    {type === "sender" && totalCount > 0 && (
                      <span className="result-table__footer-stat-item">
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