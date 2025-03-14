// File: src/components/sections/content/results/result-table.component.tsx
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

// Define the interface with className
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
  data: SenderResultData[];
}

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
      <div className={className}>
        <p>Hauler filtering not implemented.</p>
      </div>
    );
  }

  const showPlaceholder = data.length === 0 || isLoading;
  const initialData = showPlaceholder ? PLACEHOLDER_DATA : data;

  const distanceFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const typeFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const statusFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const availabilityFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const transitFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const ratingFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const contactFilterRef = useRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>(null);
  const headerRef = useRef<HTMLTableSectionElement>(null);

  const columns: Column[] = useMemo(
    () => [
      { ...distanceColumn, ref: distanceFilterRef, component: DistanceFilter, data: initialData },
      { ...typeColumn, ref: typeFilterRef, component: TypeFilter, data: initialData },
      { ...statusColumn, ref: statusFilterRef, component: StatusFilter, data: initialData },
      { ...availabilityColumn, ref: availabilityFilterRef, component: AvailabilityFilter, data: initialData },
      { ...transitColumn, ref: transitFilterRef, component: TransitFilter, data: initialData },
      { ...ratingColumn, ref: ratingFilterRef, component: RatingFilter, data: initialData },
      { ...contactColumn, ref: contactFilterRef, component: ContactFilter, data: initialData },
    ],
    [initialData]
  );

  const [filterStates, setFilterStates] = useState<{
    [key: string]: { selected: string; sortDirection: "asc" | "desc" | "none"; isOpen: boolean };
  }>(() =>
    columns.reduce((acc, col) => {
      acc[col.key] = { selected: "all", sortDirection: "none", isOpen: false };
      return acc;
    }, {} as any)
  );

  const filteredData = useMemo(() => {
    let result = [...initialData];
    columns.forEach(col => {
      const state = filterStates[col.key];
      if (state?.selected && state.selected !== "all") {
        result = col.component.filterFn(result, state.selected);
      }
    });

    const sortKey = columns.find(col => filterStates[col.key]?.sortDirection !== "none")?.key;
    if (sortKey) {
      const sortDirection = filterStates[sortKey].sortDirection;
      result.sort((a, b) => {
        const aValue = (a as any)[sortKey] ?? "";
        const bValue = (b as any)[sortKey] ?? "";
        if (sortKey === "distance" || sortKey === "rating" || sortKey === "contact") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        if (typeof aValue === "string" && typeof bValue === "string") {
          return sortDirection === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        return 0;
      });
    }

    return result;
  }, [filterStates, initialData]);

  const handleSort = (key: string) => {
    setFilterStates(prev => {
      const current = prev[key];
      const newDirection =
        current.sortDirection === "asc" ? "desc" : current.sortDirection === "desc" ? "none" : "asc";
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
    <div className={className}>
      <div className="result-table__filter-summary">
        <span>
          {appliedFilters.length > 0
            ? `Filtered by ${appliedFilters.length} column(s): ${appliedFilters.join(", ")}`
            : "No filter is applied"}
        </span>
        <button className="result-table__reset-button" onClick={resetFilters}>
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
                    data={col.data}
                    onFilter={() => {}} // Kept for compatibility
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