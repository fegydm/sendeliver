// File: src/components/sections/content/results/excel-result-table.component.tsx
// Last change: Improved resizing, header layout and filter positioning

import { useState, useEffect, useRef, useCallback } from "react";
import "./excel-table.css";
import { getAnimatedTriangle } from "@/utils/animateTriangle";
import DistanceFilter from "./DistanceFilter";
import TypeFilter from "./TypeFilter";
import StatusFilter from "./StatusFilter";
import BaseFilter from "./BaseFilter";
import truckIcon from "@/assets/truck.svg";
import vanIcon from "@/assets/van.svg";
import lorryIcon from "@/assets/lorry.svg";
import rigidIcon from "@/assets/rigid.svg";

export interface SenderResultData {
  distance: string;
  vehicleType: string;
  availabilityTime: string;
  eta: string;
  rating?: number;
  pp: number;
}

interface ResultTableProps {
  type: "sender" | "hauler";
  data?: SenderResultData[];
  className?: string;
}

// Interface for column definition with optional filter options and function
interface Column {
  label: string;
  key: string;
  ref: React.MutableRefObject<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean } | null>;
  component: React.ComponentType<any>;
  onFilter: (data: SenderResultData[]) => void;
  data: SenderResultData[];
  options?: { value: string; label: string }[];
  filterFn?: (data: SenderResultData[], selected: string) => SenderResultData[];
  isNumeric?: boolean;
  width?: number; // Width property for column sizing
  cssClass?: string; // CSS class for specific styling
  minWidth?: number; // Minimum column width
}

const availabilityFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "passed", label: "passed" },
  { value: "today", label: "today" },
  { value: "tomorrow", label: "tomorrow" },
];

const etaFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "1", label: "up to 1 hr" },
  { value: "2", label: "up to 2 hrs" },
  { value: "5", label: "up to 5 hrs" },
];

const ppFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "verified", label: "verified" },
];

const ratingFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "4.5", label: "4,5 and more" },
  { value: "4.0", label: "4,0 and more" },
  { value: "3.5", label: "3,5 and more" },
];

// Map vehicle types to icons
const vehicleIcons: { [key: string]: string } = {
  truck: truckIcon,
  van: vanIcon,
  lorry: lorryIcon,
  rigid: rigidIcon,
};

// Determine status value (G/O/R)
const getStatusValue = (record: SenderResultData): string => {
  const now = new Date();
  const availTime = new Date(record.availabilityTime);
  const loadingTime = new Date(record.eta);
  if (availTime < loadingTime && availTime < now) return "G";
  else if (availTime < loadingTime && availTime > now) return "O";
  else if (availTime > loadingTime) return "R";
  return "";
};

const ExcelResultTable: React.FC<ResultTableProps> = ({ type, data = [] }) => {
  if (type !== "sender") {
    return (
      <div className="excel-table">
        <p>Hauler filtering not implemented.</p>
      </div>
    );
  }

  const senderData = data as SenderResultData[];
  const [distanceFilteredData, setDistanceFilteredData] = useState(senderData);
  const [typeFilteredData, setTypeFilteredData] = useState(senderData);
  const [statusFilteredData, setStatusFilteredData] = useState(senderData);
  const [availabilityFilteredData, setAvailabilityFilteredData] = useState(senderData);
  const [etaFilteredData, setEtaFilteredData] = useState(senderData);
  const [ppFilteredData, setPpFilteredData] = useState(senderData);
  const [ratingFilteredData, setRatingFilteredData] = useState(senderData);
  const [sortState, setSortState] = useState<{ key: string; direction: "asc" | "desc" | "none" }>({ key: "", direction: "none" });
  const [columnWidths, setColumnWidths] = useState<{[key: string]: number}>({});
  const [isResizing, setIsResizing] = useState<string | null>(null);
  const [, setFilterPosition] = useState<{top: number, left: number, columnKey: string | null}>({top: 0, left: 0, columnKey: null});
  
  // Refs for filter components
  const distanceFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const typeFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const statusFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const availabilityFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const etaFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const ppFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const ratingFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);
  const tableRef = useRef<HTMLTableElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cellRefs = useRef<{[key: string]: HTMLElement | null}>({});

  // Define columns with default widths and CSS classes
  const columns: Column[] = [
    { 
      label: "Distance", 
      key: "distance", 
      ref: distanceFilterRef, 
      component: DistanceFilter, 
      onFilter: setDistanceFilteredData, 
      data: senderData,
      isNumeric: true,
      width: 100,
      minWidth: 80,
      cssClass: "excel-table__col--distance"
    },
    { 
      label: "Type", 
      key: "vehicleType", 
      ref: typeFilterRef, 
      component: TypeFilter, 
      onFilter: setTypeFilteredData, 
      data: distanceFilteredData,
      width: 100,
      minWidth: 80,
      cssClass: "excel-table__col--type"
    },
    { 
      label: "Status", 
      key: "status", 
      ref: statusFilterRef, 
      component: StatusFilter, 
      onFilter: setStatusFilteredData, 
      data: typeFilteredData,
      width: 200,
      minWidth: 120,
      cssClass: "excel-table__col--status"
    },
    {
      label: "Availability",
      key: "availabilityTime",
      ref: availabilityFilterRef,
      component: BaseFilter,
      onFilter: setAvailabilityFilteredData,
      data: statusFilteredData,
      options: availabilityFilterOptions,
      width: 120,
      minWidth: 100,
      cssClass: "excel-table__col--availability",
      filterFn: (data, selected) => {
        if (selected === "all") return data;
        return data.filter(record => {
          const availDate = new Date(record.availabilityTime);
          const now = new Date();
          if (selected === "passed") return availDate < now;
          if (selected === "today") return availDate.toDateString() === now.toDateString();
          if (selected === "tomorrow") {
            const tomorrow = new Date(now); tomorrow.setDate(now.getDate() + 1);
            return availDate.toDateString() === tomorrow.toDateString();
          }
          return true;
        });
      },
    },
    {
      label: "ETA",
      key: "eta",
      ref: etaFilterRef,
      component: BaseFilter,
      onFilter: setEtaFilteredData,
      data: availabilityFilteredData,
      options: etaFilterOptions,
      isNumeric: true,
      width: 80,
      minWidth: 60,
      cssClass: "excel-table__col--eta",
      filterFn: (data, selected) => {
        if (selected === "all") return data;
        const thresholdHours = parseFloat(selected);
        const now = new Date();
        return data.filter(record => {
          const etaDate = new Date(record.eta);
          const diffHours = (etaDate.getTime() - now.getTime()) / (1000 * 60 * 60);
          return diffHours <= thresholdHours;
        });
      },
    },
    {
      label: "PP",
      key: "pp",
      ref: ppFilterRef,
      component: BaseFilter,
      onFilter: setPpFilteredData,
      data: etaFilteredData,
      options: ppFilterOptions,
      isNumeric: true,
      width: 80,
      minWidth: 60,
      cssClass: "excel-table__col--pp",
      filterFn: (data, selected) => {
        if (selected === "all") return data;
        return data.filter(record => selected === "verified" && record.pp > 0);
      },
    },
    {
      label: "Rating",
      key: "rating",
      ref: ratingFilterRef,
      component: BaseFilter,
      onFilter: setRatingFilteredData,
      data: ppFilteredData,
      options: ratingFilterOptions,
      isNumeric: true,
      width: 100,
      minWidth: 80,
      cssClass: "excel-table__col--rating",
      filterFn: (data, selected) => {
        if (selected === "all") return data;
        const thresholdRating = parseFloat(selected);
        return data.filter(record => record.rating !== undefined && record.rating >= thresholdRating);
      },
    },
  ];

  // Initialize column widths from defaults
  useEffect(() => {
    const initialWidths: {[key: string]: number} = {};
    columns.forEach(col => {
      initialWidths[col.key] = col.width || 100;
    });
    setColumnWidths(initialWidths);
  }, []);

  // Calculate total table width to determine if scrolling is needed
  const calculateTotalWidth = useCallback(() => {
    let total = 0;
    columns.forEach(col => {
      total += columnWidths[col.key] || col.width || 100;
    });
    return total;
  }, [columns, columnWidths]);

  // Update table width and scrolling when column widths change
  useEffect(() => {
    const totalWidth = calculateTotalWidth();
    if (tableRef.current && scrollContainerRef.current) {
      const containerWidth = scrollContainerRef.current.clientWidth;
      
      // Only set min-width if total is greater than container
      // This ensures scrolling only happens when needed
      if (totalWidth > containerWidth) {
        tableRef.current.style.minWidth = `${totalWidth}px`;
      } else {
        tableRef.current.style.minWidth = 'auto';
      }
    }
  }, [columnWidths, calculateTotalWidth]);

  // Handle column sorting
  const handleSort = (key: string) => {
    const newDirection = sortState.key === key && sortState.direction === "asc" ? "desc" : sortState.direction === "desc" ? "none" : "asc";
    setSortState({ key, direction: newDirection });
    
    if (newDirection === "none") {
      setDistanceFilteredData(senderData);
      return;
    }
    
    const sortedData = [...senderData].sort((a, b) => {
      const aValue = (a as any)[key];
      const bValue = (b as any)[key];
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return newDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      return newDirection === "asc" ? (aValue - bValue) : (bValue - aValue);
    });
    
    setDistanceFilteredData(sortedData);
  };

  // Column resize handlers with improved performance
  const handleResizeStart = (key: string, e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(key);
    
    // Store initial positions to avoid recalculating during resize
    const initialPos = {
      clientX: e.clientX,
      width: columnWidths[key] || columns.find(col => col.key === key)?.width || 100
    };
    
    const handleMouseMove = (e: MouseEvent) => {
      // Calculate width change directly from mouse movement
      const delta = e.clientX - initialPos.clientX;
      const newWidth = Math.max(
        columns.find(col => col.key === key)?.minWidth || 50,
        initialPos.width + delta
      );
      
      // Only update if width has changed
      if (newWidth !== columnWidths[key]) {
        setColumnWidths(prev => ({
          ...prev,
          [key]: newWidth
        }));
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsResizing(null);
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Update filter position when filter is opened
  const updateFilterPosition = (columnKey: string) => {
    const cellElement = cellRefs.current[columnKey];
    if (cellElement) {
      const rect = cellElement.getBoundingClientRect();
      setFilterPosition({
        top: rect.bottom,
        left: rect.right - 150, // Position filter toward the right side
        columnKey
      });
    }
  };

  const appliedFilters = columns.filter(col => col.ref.current?.isFiltered()).map(col => col.label);

  const resetFilters = () => {
    columns.forEach(col => col.ref.current?.reset());
    setDistanceFilteredData(senderData);
    setTypeFilteredData(senderData);
    setStatusFilteredData(senderData);
    setAvailabilityFilteredData(senderData);
    setEtaFilteredData(senderData);
    setPpFilteredData(senderData);
    setRatingFilteredData(senderData);
    setSortState({ key: "", direction: "none" });
  };

  // Handle click outside filters and Escape key
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        columns.forEach(col => {
          if (col.ref.current?.isOpen()) col.ref.current?.reset();
        });
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        columns.forEach(col => {
          if (col.ref.current?.isOpen()) col.ref.current?.reset();
        });
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [columns]);

  // Render cell content based on column type
  const renderCellContent = (col: Column, row: SenderResultData) => {
    if (col.key === "rating") {
      return (
        <div className="rating-cell">
          <span className="rating-star">★</span>
          {row.rating !== undefined ? row.rating.toFixed(1) : "N/A"}
        </div>
      );
    }
    
    if (col.key === "eta") {
      const etaDate = new Date(row.eta);
      return isNaN(etaDate.getTime()) ? "N/A" : etaDate.getHours();
    }
    
    if (col.key === "vehicleType") {
      return row.vehicleType;
    }
    
    if (col.key === "status") {
      const statusVal = getStatusValue(row);
      let statusClass = "";
      let statusText = "";
      
      switch (statusVal) {
        case "G": 
          statusClass = "status-indicator--green"; 
          statusText = "available now"; 
          break;
        case "O": 
          statusClass = "status-indicator--orange"; 
          statusText = "available as scheduled"; 
          break;
        case "R": 
          statusClass = "status-indicator--red"; 
          statusText = "available later"; 
          break;
        default: 
          break;
      }
      
      const vehicleIcon = vehicleIcons[row.vehicleType.toLowerCase()] || truckIcon;
      
      return (
        <div style={{ display: "flex", alignItems: "center" }}>
          <img
            src={vehicleIcon}
            alt={`${row.vehicleType} Icon`}
            className="vehicle-icon"
          />
          <span className={statusClass}>{statusVal} - {statusText}</span>
        </div>
      );
    }
    
    if (col.key === "availabilityTime") {
      const availDate = new Date(row.availabilityTime);
      const now = new Date();
      let availLabel = "";
      
      if (availDate < now) availLabel = "passed";
      else if (availDate.toDateString() === now.toDateString()) availLabel = "today";
      else {
        const tomorrow = new Date(now); 
        tomorrow.setDate(now.getDate() + 1);
        if (availDate.toDateString() === tomorrow.toDateString()) availLabel = "tomorrow";
        else availLabel = availDate.toLocaleDateString();
      }
      
      return availLabel;
    }
    
    // Default return for other columns
    return (row as any)[col.key]?.toString() || "N/A";
  };

  const handleFilterToggle = (columnKey: string, isOpening: boolean) => {
    if (isOpening) {
      updateFilterPosition(columnKey);
    }
  };

  return (
    <div className="excel-table">
      <div className="excel-table__filter-summary">
        <span>
          {appliedFilters.length > 0
            ? `Filtered by ${appliedFilters.length} column(s): ${appliedFilters.join(", ")}`
            : "No filter is applied"}
        </span>
        <button className="excel-table__reset-button" onClick={resetFilters}>
          Reset Filters
        </button>
      </div>
      
      <div className="excel-table__scroll" ref={scrollContainerRef}>
        <table className="excel-table__table" ref={tableRef}>
          <colgroup>
            {columns.map(col => (
              <col 
                key={col.key} 
                style={{ width: `${columnWidths[col.key] || col.width || 100}px` }} 
                className={col.cssClass}
              />
            ))}
          </colgroup>
          
          <thead ref={headerRef} className="excel-table__header">
            <tr className="excel-table__header-row">
              {columns.map(col => {
                const isFiltered = col.ref.current?.isFiltered() || false;
                const isOpen = col.ref.current?.isOpen() || false;
                
                return (
                  <th
                    key={col.key}
                    className={`excel-table__header-cell ${isFiltered ? "excel-table__header-cell--filtered" : ""} ${isOpen ? "excel-table__header-cell--open" : ""}`}
                    style={{ width: `${columnWidths[col.key] || col.width || 100}px` }}
                    ref={(el) => { cellRefs.current[col.key] = el; }}
                  >
                    <div className="excel-table__header-content">
                      <span className="excel-table__header-sort" onClick={() => handleSort(col.key)}>
                        {sortState.key === col.key ? getAnimatedTriangle(sortState.direction) : getAnimatedTriangle("none")}
                        {col.label}
                        
                        {/* Special wrapper for filter component to handle positioning */}
                        <div 
                          style={{ 
                            position: "relative",
                            zIndex: isOpen ? 1000 : 1
                          }}
                          onClick={(e) => {
                            // Prevent click from reaching the sort handler
                            e.stopPropagation();
                            handleFilterToggle(col.key, !isOpen);
                          }}
                        >
                          <col.component
                            data={col.data}
                            onFilter={col.onFilter}
                            ref={col.ref}
                            label={col.label}
                            options={col.options}
                            filterFn={col.filterFn}
                          />
                        </div>
                      </span>
                    </div>
                    <div 
                      className={`excel-table__resizer ${isResizing === col.key ? 'excel-table__resizer--active' : ''}`}
                      onMouseDown={(e) => handleResizeStart(col.key, e)}
                    />
                  </th>
                );
              })}
            </tr>
          </thead>
          
          <tbody className="excel-table__body">
            {ratingFilteredData.length === 0 ? (
              <tr className="excel-table__body-row">
                <td className="excel-table__empty" colSpan={columns.length}>
                  Your requirements do not match any record
                </td>
              </tr>
            ) : (
              ratingFilteredData.map((row, rowIndex) => (
                <tr key={rowIndex} className="excel-table__body-row">
                  {columns.map(col => (
                    <td 
                      key={col.key} 
                      className={`excel-table__body-cell ${col.isNumeric ? 'excel-table__body-cell--number' : ''}`}
                      style={{ width: `${columnWidths[col.key] || col.width || 100}px` }}
                    >
                      {renderCellContent(col, row)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ExcelResultTable;