// File: src/components/sections/content/results/result-table.component.tsx
// Last modified: March 13, 2025 - Updated placeholder data with custom values

import { useState, useEffect, useRef } from "react";
import "./result-table.css";
import DistanceFilter from "./DistanceFilter";
import TypeFilter from "./TypeFilter";
import StatusFilter from "./StatusFilter";
import AvailabilityFilter from "./AvailabilityFilter";
import TransitFilter from "./TransitFilter";
import RatingFilter from "./RatingFilter";
import ContactFilter from "./ContactFilter";

export interface SenderResultData {
  distance: number;
  type: string;
  availability: string;
  transit: string;
  rating?: number;
  contact: number;
  name_carrier?: string; // Added for carrier name
}

interface ResultTableProps {
  type: "sender" | "hauler";
  data?: SenderResultData[];
  isLoading?: boolean;
}

interface Column {
  label: string;
  key: string;
  ref: React.RefObject<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>;
  component: React.ForwardRefExoticComponent<any> & { renderCell?: (row: SenderResultData) => React.ReactNode };
  onFilter: (filtered: SenderResultData[]) => void;
  data: SenderResultData[];
}

// Calculate placeholder availability as now + 2 hours
const getPlaceholderAvailability = (): string => {
  const now = new Date();
  const availabilityTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // now + 2 hours
  return availabilityTime.toISOString();
};

const PLACEHOLDER_DATA: SenderResultData[] = [
  {
    distance: 48,
    type: "truck",
    availability: getPlaceholderAvailability(), // now + 2 hours
    transit: "2,5", // Will display as 2,5 hrs
    rating: 4.2,    // Rating of 4.2
    contact: 1,
    name_carrier: "OmegaTrans" // Company name for contact hover
  }
];

const ResultTable: React.FC<ResultTableProps> = ({ type, data = [], isLoading = false }) => {
  if (type !== "sender") {
    return <div className="result-table"><p>Hauler filtering not implemented.</p></div>;
  }

  const showPlaceholder = data.length === 0 || isLoading;
  const initialData = showPlaceholder ? PLACEHOLDER_DATA : data;

  const [distanceFilteredData, setDistanceFilteredData] = useState(initialData);
  const [typeFilteredData, setTypeFilteredData] = useState(initialData);
  const [statusFilteredData, setStatusFilteredData] = useState(initialData);
  const [availabilityFilteredData, setAvailabilityFilteredData] = useState(initialData);
  const [transitFilteredData, setTransitFilteredData] = useState(initialData);
  const [ratingFilteredData, setRatingFilteredData] = useState(initialData);
  const [contactFilteredData, setContactFilteredData] = useState(initialData);
  const [filterStates, setFilterStates] = useState<{
    [key: string]: { selected: string; sortDirection: "asc" | "desc" | "none"; isOpen: boolean };
  }>({});

  // Propagate filter changes through the chain
  useEffect(() => {
    setDistanceFilteredData(initialData); // Reset to initial data
  }, [initialData]);

  useEffect(() => {
    setTypeFilteredData(distanceFilteredData);
  }, [distanceFilteredData]);

  useEffect(() => {
    setStatusFilteredData(typeFilteredData);
  }, [typeFilteredData]);

  useEffect(() => {
    setAvailabilityFilteredData(statusFilteredData);
  }, [statusFilteredData]);

  useEffect(() => {
    setTransitFilteredData(availabilityFilteredData);
  }, [availabilityFilteredData]);

  useEffect(() => {
    setRatingFilteredData(transitFilteredData);
  }, [transitFilteredData]);

  useEffect(() => {
    setContactFilteredData(ratingFilteredData);
  }, [ratingFilteredData]);

  const distanceFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const typeFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const statusFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const availabilityFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const transitFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const ratingFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const contactFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);

  const columns: Column[] = [
    { label: "Distance", key: "distance", ref: distanceFilterRef, component: DistanceFilter, onFilter: setDistanceFilteredData, data: initialData },
    { label: "Type", key: "type", ref: typeFilterRef, component: TypeFilter, onFilter: setTypeFilteredData, data: distanceFilteredData },
    { label: "Status", key: "status", ref: statusFilterRef, component: StatusFilter, onFilter: setStatusFilteredData, data: typeFilteredData },
    { label: "Availability", key: "availability", ref: availabilityFilterRef, component: AvailabilityFilter, onFilter: setAvailabilityFilteredData, data: statusFilteredData },
    { label: "Transit", key: "transit", ref: transitFilterRef, component: TransitFilter, onFilter: setTransitFilteredData, data: availabilityFilteredData },
    { label: "Rating", key: "rating", ref: ratingFilterRef, component: RatingFilter, onFilter: setRatingFilteredData, data: transitFilteredData },
    { label: "Contact", key: "contact", ref: contactFilterRef, component: ContactFilter, onFilter: setContactFilteredData, data: ratingFilteredData },
  ];

  useEffect(() => {
    const initialStates = columns.reduce((acc, col) => {
      acc[col.key] = { selected: "all", sortDirection: "none", isOpen: false };
      return acc;
    }, {} as any);
    setFilterStates(initialStates);
  }, []);

  const handleSort = (key: string) => {
    setFilterStates(prev => {
      const current = prev[key];
      const newDirection =
        current.sortDirection === "asc" ? "desc" : current.sortDirection === "desc" ? "none" : "asc";
      const column = columns.find(c => c.key === key)!;
      const filtered = current.selected === "all" ? column.data : column.data;
      const sorted = newDirection === "none" ? filtered : [...filtered].sort((a, b) => {
        const aValue = (a as any)[key] ?? "";
        const bValue = (b as any)[key] ?? "";
        if (key === "distance") {
          return newDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === "string" && typeof bValue === "string") {
          return newDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return newDirection === "asc" ? aValue - bValue : bValue - aValue;
      });
      column.onFilter(sorted);
      return { ...prev, [key]: { ...current, sortDirection: newDirection } };
    });
  };

  const handleToggle = (key: string) => {
    setFilterStates(prev => ({ ...prev, [key]: { ...prev[key], isOpen: !prev[key].isOpen } }));
  };

  const handleOptionSelect = (key: string, value: string) => {
    setFilterStates(prev => ({ ...prev, [key]: { ...prev[key], selected: value, isOpen: false } }));
  };

  const resetFilters = () => {
    columns.forEach(col => {
      col.ref.current?.reset();
      setFilterStates(prev => ({ ...prev, [col.key]: { selected: "all", sortDirection: "none", isOpen: false } }));
    });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(event.target as Node)) {
        setFilterStates(prev => {
          const updated = { ...prev };
          Object.keys(updated).forEach(key => {
            if (updated[key].isOpen) updated[key].isOpen = false;
          });
          return updated;
        });
      }
    };

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

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const appliedFilters = columns.filter(col => filterStates[col.key]?.selected !== "all").map(col => col.label);

  return (
    <div className={`result-table ${showPlaceholder ? 'result-table--placeholder' : ''}`}>
      <div className="result-table__filter-summary">
        <span>{appliedFilters.length > 0 ? `Filtered by ${appliedFilters.length} column(s): ${appliedFilters.join(", ")}` : "No filter is applied"}</span>
        <button className="result-table__reset-button" onClick={resetFilters}>Reset Filters</button>
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
                className={`result-table__header-cell ${filterStates[col.key]?.selected !== "all" ? "result-table__header-cell--filtered" : ""} ${filterStates[col.key]?.isOpen ? "result-table__header-cell--open" : ""}`}
              >
                <div className="header-cell__content">
                  <col.component
                    data={col.data}
                    onFilter={col.onFilter}
                    ref={col.ref}
                    label={col.label}
                    selected={filterStates[col.key]?.selected || "all"}
                    sortDirection={filterStates[col.key]?.sortDirection || "none"}
                    isOpen={filterStates[col.key]?.isOpen || false}
                    onSortClick={(e: React.MouseEvent) => { e.stopPropagation(); handleSort(col.key); }}
                    onToggleClick={(e: React.MouseEvent) => { e.stopPropagation(); handleToggle(col.key); }}
                    onOptionSelect={(value: string) => handleOptionSelect(col.key, value)}
                  />
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="result-table__body">
          {contactFilteredData.length === 0 ? (
            <tr className="result-table__body-row">
              <td className="result-table__body-cell" colSpan={columns.length}>Your requirements do not match any record</td>
            </tr>
          ) : contactFilteredData.map((row, rowIndex) => (
            <tr key={rowIndex} className={`result-table__body-row ${showPlaceholder ? 'result-table__body-row--placeholder' : ''}`}>
              {columns.map(col => (
                <td key={col.key} className="result-table__body-cell">
                  {col.component.renderCell ? (
                    col.component.renderCell(row)
                  ) : (
                    col.key === "distance" && row.distance !== undefined ?
                      `${row.distance} km` :
                      (row[col.key as keyof SenderResultData]?.toString() || "N/A")
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ResultTable;