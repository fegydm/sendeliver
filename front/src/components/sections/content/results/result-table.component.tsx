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
  availability_date: string;
  availability_time: string;
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
  totalCount?: number;
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

const getPlaceholderAvailability = () => {
  const now = new Date();
  const availabilityTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now
  const result = {
    date: availabilityTime.toISOString().split("T")[0], // "YYYY-MM-DD"
    time: `${availabilityTime.getHours().toString().padStart(2, "0")}:${availabilityTime
      .getMinutes()
      .toString()
      .padStart(2, "0")}:00`, // "HH:MM:SS"
  };
  return result;
};

const PLACEHOLDER_DATA: SenderResultData[] = [
  {
    distance: 48,
    type: "truck",
    status: "available",
    availability_date: getPlaceholderAvailability().date,
    availability_time: getPlaceholderAvailability().time,
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
  className = "",
  totalCount = 0,
}) => {
  if (type !== "sender") {
    return (
      <div className={`result-table ${className}`}>
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
      { ...distanceColumn, ref: distanceFilterRef, component: DistanceFilter },
      { ...typeColumn, ref: typeFilterRef, component: TypeFilter },
      { ...statusColumn, ref: statusFilterRef, component: StatusFilter },
      { ...availabilityColumn, key: "availability_date", ref: availabilityFilterRef, component: AvailabilityFilter },
      { ...transitColumn, ref: transitFilterRef, component: TransitFilter },
      { ...ratingColumn, ref: ratingFilterRef, component: RatingFilter },
      { ...contactColumn, ref: contactFilterRef, component: ContactFilter },
    ],
    []
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
    const sortedColumn = columns.find(col => filterStates[col.key]?.sortDirection !== "none");
    if (sortedColumn) {
      const sortKey = sortedColumn.key;
      const sortDirection = filterStates[sortKey].sortDirection;
      result.sort((a, b) => {
        const aValue = a[sortKey];
        const bValue = b[sortKey];
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        const aStr = String(aValue || "");
        const bStr = String(bValue || "");
        return sortDirection === "asc" ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
      });
    }
    return result;
  }, [initialData, columns, filterStates]);

  const handleSort = (key: string) => {
    setFilterStates(prev => {
      const current = prev[key];
      const newDirection =
        current.sortDirection === "asc" ? "desc" : current.sortDirection === "desc" ? "none" : "asc";
      return { ...prev, [key]: { ...current, sortDirection: newDirection } };
    });
  };

  const handleToggle = (key: string) => {
    setFilterStates(prev => {
      const updated = { ...prev };
      Object.keys(updated).forEach(k => {
        if (k !== key && updated[k].isOpen) {
          updated[k] = { ...updated[k], isOpen: false };
        }
      });
      return { ...updated, [key]: { ...updated[key], isOpen: !updated[key].isOpen } };
    });
  };

  const handleOptionSelect = (key: string, value: string) => {
    setFilterStates(prev => ({ ...prev, [key]: { ...prev[key], selected: value, isOpen: false } }));
  };

  const resetFilters = () => {
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
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

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
      <div className="result-table__scroll-container">
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
                  {columns.map(col => {
                    const cellContent = col.component.renderCell(row);
                    return (
                      <td key={col.key} className="result-table__body-cell">
                        {cellContent}
                      </td>
                    );
                  })}
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
                      Showing <strong>{filteredData.length}</strong> of <strong>{initialData.length}</strong> matching
                      vehicles
                    </span>
                    {totalCount > 0 && (
                      <span className="result-table__stat-item">
                        Total deliveries in last 40h: <strong>{totalCount}</strong>
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
