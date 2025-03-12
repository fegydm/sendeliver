// File: src/components/sections/content/results/result-table.component.tsx
// Last modified: March 12, 2025
import { useState, useEffect, useRef } from "react";
import "./result-table.css";
import DistanceFilter from "./DistanceFilter";
import TypeFilter from "./TypeFilter";
import StatusFilter from "./StatusFilter";
import AvailabilityFilter from "./AvailabilityFilter";
import TransitFilter from "./TransitFilter";
import ContactFilter from "./ContactFilter";
import RatingFilter from "./RatingFilter";

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
}

interface Column {
  label: string;
  key: string;
  ref: React.RefObject<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>;
  component: React.ForwardRefExoticComponent<any> & { renderCell?: (row: SenderResultData) => React.ReactNode };
  onFilter: (filtered: SenderResultData[]) => void;
  data: SenderResultData[];
  filterFn?: (data: SenderResultData[], selected: string) => SenderResultData[];
}

const ResultTable: React.FC<ResultTableProps> = ({ type, data = [] }) => {
  if (type !== "sender") {
    return <div className="result-table"><p>Hauler filtering not implemented.</p></div>;
  }

  const senderData = data as SenderResultData[];
  const [distanceFilteredData, setDistanceFilteredData] = useState(senderData);
  const [typeFilteredData, setTypeFilteredData] = useState(senderData);
  const [statusFilteredData, setStatusFilteredData] = useState(senderData);
  const [availabilityFilteredData, setAvailabilityFilteredData] = useState(senderData);
  const [etaFilteredData, setEtaFilteredData] = useState(senderData);
  const [ppFilteredData, setPpFilteredData] = useState(senderData);
  const [ratingFilteredData, setRatingFilteredData] = useState(senderData);
  const [filterStates, setFilterStates] = useState<{
    [key: string]: { selected: string; sortDirection: "asc" | "desc" | "none"; isOpen: boolean };
  }>({});

  const distanceFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const typeFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const statusFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const availabilityFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const etaFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const ppFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const ratingFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);

  const columns: Column[] = [
    { label: "Distance", key: "distance", ref: distanceFilterRef, component: DistanceFilter, onFilter: setDistanceFilteredData, data: senderData, filterFn: (d, s) => d.filter(item => item.distance === s) },
    { label: "Type", key: "vehicleType", ref: typeFilterRef, component: TypeFilter, onFilter: setTypeFilteredData, data: distanceFilteredData, filterFn: (d, s) => d.filter(item => item.vehicleType === s) },
    { label: "Status", key: "status", ref: statusFilterRef, component: StatusFilter, onFilter: setStatusFilteredData, data: typeFilteredData },
    { label: "Availability", key: "availabilityTime", ref: availabilityFilterRef, component: AvailabilityFilter, onFilter: setAvailabilityFilteredData, data: statusFilteredData, filterFn: (d, s) => d.filter(item => item.availabilityTime === s) },
    { label: "Transit", key: "eta", ref: etaFilterRef, component: TransitFilter, onFilter: setEtaFilteredData, data: availabilityFilteredData, filterFn: (d, s) => d.filter(item => item.eta === s) },
    { label: "Contact", key: "pp", ref: ppFilterRef, component: ContactFilter, onFilter: setPpFilteredData, data: etaFilteredData },
    { label: "Rating", key: "rating", ref: ratingFilterRef, component: RatingFilter, onFilter: setRatingFilteredData, data: ppFilteredData, filterFn: (d, s) => d.filter(item => item.rating === parseInt(s)) },
  ];

  useEffect(() => {
    // Inicializácia stavov pre každý stĺpec
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
      const filtered = current.selected === "all" ? columns.find(c => c.key === key)!.data : columns.find(c => c.key === key)!.filterFn!(columns.find(c => c.key === key)!.data, current.selected);
      const sorted = newDirection === "none" ? filtered : [...filtered].sort((a, b) => {
        const aValue = (a as any)[key] || "";
        const bValue = (b as any)[key] || "";
        if (typeof aValue === "string" && typeof bValue === "string") {
          return newDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return newDirection === "asc" ? aValue - bValue : bValue - aValue;
      });
      columns.find(c => c.key === key)!.onFilter(sorted);
      return { ...prev, [key]: { ...current, sortDirection: newDirection } };
    });
  };

  const handleToggle = (key: string) => {
    setFilterStates(prev => ({ ...prev, [key]: { ...prev[key], isOpen: !prev[key].isOpen } }));
  };

  const handleOptionSelect = (key: string, value: string) => {
    setFilterStates(prev => {
      const column = columns.find(c => c.key === key)!;
      const filtered = value === "all" ? column.data : column.filterFn ? column.filterFn(column.data, value) : column.data;
      column.onFilter(filtered);
      return { ...prev, [key]: { ...prev[key], selected: value, isOpen: false } };
    });
  };

  const resetFilters = () => {
    columns.forEach(col => {
      col.onFilter(senderData);
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
    <div className="result-table">
      <div className="result-table__filter-summary">
        <span>{appliedFilters.length > 0 ? `Filtered by ${appliedFilters.length} column(s): ${appliedFilters.join(", ")}` : "No filter is applied"}</span>
        <button className="result-table__reset-button" onClick={resetFilters}>Reset Filters</button>
      </div>
      <table className="result-table__table">
        <thead ref={headerRef} className="result-table__header">
          <tr className="result-table__header-row">
            {columns.map(col => (
              <th
                key={col.key}
                className={`result-table__header-cell ${filterStates[col.key]?.selected !== "all" ? "result-table__header-cell--filtered" : ""} ${filterStates[col.key]?.isOpen ? "result-table__header-cell--open" : ""}`}
                onClick={() => handleToggle(col.key)}
              >
                <col.component
                  data={col.data}
                  label={col.label}
                  options={col.key === "distance" ? [{ value: "10", label: "10km" }, { value: "20", label: "20km" }] : undefined} // Príklad options
                  selected={filterStates[col.key]?.selected || "all"}
                  sortDirection={filterStates[col.key]?.sortDirection || "none"}
                  isOpen={filterStates[col.key]?.isOpen || false}
                  onSortClick={(e: React.MouseEvent) => handleSort(col.key)}
                  onToggleClick={() => handleToggle(col.key)}
                  onOptionSelect={(value: string) => handleOptionSelect(col.key, value)}
                  ref={col.ref}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="result-table__body">
          {ratingFilteredData.length === 0 ? (
            <tr className="result-table__body-row">
              <td className="result-table__body-cell" colSpan={columns.length}>Your requirements do not match any record</td>
            </tr>
          ) : (
            ratingFilteredData.map((row, rowIndex) => (
              <tr key={rowIndex} className="result-table__body-row">
                {columns.map(col => (
                  <td key={col.key} className="result-table__body-cell">
                    {col.component.renderCell ? col.component.renderCell(row) : (row as any)[col.key]?.toString() || "N/A"}
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