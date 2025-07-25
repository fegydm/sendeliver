import { useState, useEffect } from "react";
import { SenderResultData } from "./result-table.component";

interface FilterState {
  selected: string;
  sortDirection: "asc" | "desc" | "none";
}

interface Column {
  key: string;
  label: string;
  filterFn: (data: SenderResultData[], selected: string) => SenderResultData[];
}

interface FilterManagerProps {
  initialData: SenderResultData[];
  columns: Column[];
  onFilteredDataChange: (filteredData: SenderResultData[]) => void;
}

export const useFilterManager = ({ initialData, columns, onFilteredDataChange }: FilterManagerProps) => {
  const [filterStates, setFilterStates] = useState<Record<string, FilterState>>({});
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [openFilter, setOpenFilter] = useState<string | null>(null); // Only one open filter at a time

  useEffect(() => {
    const initialStates = columns.reduce((acc, col) => {
      acc[col.key] = { selected: "all", sortDirection: "none" };
      return acc;
    }, {} as Record<string, FilterState>);
    setFilterStates(initialStates);
  }, [columns]);

  useEffect(() => {
    const filteredData = columns.reduce((data, col) => {
      const selectedValue = activeFilters[col.key];
      return selectedValue ? col.filterFn(data, selectedValue) : data;
    }, [...initialData]);

    const sortedData = [...filteredData].sort((a, b) => {
      for (const col of columns) {
        const state = filterStates[col.key];
        if (state.sortDirection !== "none") {
          const aValue = (a as any)[col.key] ?? "";
          const bValue = (b as any)[col.key] ?? "";
          const compare = typeof aValue === "number" && typeof bValue === "number"
            ? aValue - bValue
            : String(aValue).localeCompare(String(bValue));

          if (compare !== 0) {
            return state.sortDirection === "asc" ? compare : -compare;
          }
        }
      }
      return 0;
    });

    onFilteredDataChange(sortedData);
  }, [activeFilters, filterStates, initialData]);

  const handleSort = (key: string) => {
    setFilterStates(prev => ({
      ...prev,
      [key]: { 
        ...prev[key], 
        sortDirection: prev[key].sortDirection === "asc" ? "desc" 
                      : prev[key].sortDirection === "desc" ? "none" 
                      : "asc" 
      }
    }));
  };

  const handleToggle = (key: string) => {
    setOpenFilter(prev => (prev === key ? null : key));
  };

  const handleOptionSelect = (key: string, value: string) => {
    setFilterStates(prev => ({
      ...prev,
      [key]: { ...prev[key], selected: value },
    }));

    setActiveFilters(prev => {
      const newFilters = { ...prev };
      if (value === "all") delete newFilters[key];
      else newFilters[key] = value;
      return newFilters;
    });

    setOpenFilter(null); // Close dropdown after selection
  };

  const resetFilters = () => {
    setFilterStates(prev => 
      Object.keys(prev).reduce((acc, key) => {
        acc[key] = { selected: "all", sortDirection: "none" };
        return acc;
      }, {} as Record<string, FilterState>)
    );
    setActiveFilters({});
  };

  const appliedFilters = columns
    .filter(col => filterStates[col.key]?.selected !== "all")
    .map(col => col.label);

  return {
    filterStates,
    openFilter,
    handleSort,
    handleToggle,
    handleOptionSelect,
    resetFilters,
    appliedFilters,
  };
};
