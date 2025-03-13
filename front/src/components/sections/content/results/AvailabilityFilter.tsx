// File: src/components/sections/content/results/AvailabilityFilter.tsx
// Last modified: March 13, 2025 - Updated date formatting to "mmm dd, hh:mm"

import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import BaseFilter from "./BaseFilter";
import { SenderResultData } from "./result-table.component";

interface AvailabilityFilterProps {
  data: SenderResultData[];
  onFilter: (filtered: SenderResultData[]) => void;
  label: string;
  selected: string;
  sortDirection: "asc" | "desc" | "none";
  isOpen: boolean;
  onSortClick: (e: React.MouseEvent) => void;
  onToggleClick: (e: React.MouseEvent) => void;
  onOptionSelect: (value: string) => void;
}

const availabilityFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "passed", label: "passed" },
  { value: "today", label: "today" },
  { value: "tomorrow", label: "tomorrow" },
];

// Helper function to format date in "mmm dd, hh:mm" format
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    
    return `${month} ${day}, ${hours}:${minutes}`;
  } catch (error) {
    return "Invalid date";
  }
};

// Define the component type with static renderCell
interface AvailabilityFilterComponent
  extends ForwardRefExoticComponent<
    AvailabilityFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>
  > {
  renderCell?: (row: SenderResultData) => React.ReactNode;
}

const AvailabilityFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  AvailabilityFilterProps
>(({ data, onFilter, label, selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect }, ref) => {
  const filterFn = (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    
    return data.filter(record => {
      if (!record || !record.availability) return false;
      
      const availDate = new Date(record.availability);
      if (isNaN(availDate.getTime())) return false;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const dayAfterTomorrow = new Date(today);
      dayAfterTomorrow.setDate(today.getDate() + 2);
      
      // Reset time component for date comparisons
      const availDateNoTime = new Date(availDate.getFullYear(), availDate.getMonth(), availDate.getDate());
      
      switch (selected) {
        case "passed":
          return availDate < now;
        case "today":
          return availDateNoTime.getTime() === today.getTime();
        case "tomorrow":
          return availDateNoTime.getTime() === tomorrow.getTime();
        default:
          return false;
      }
    });
  };

  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label={label}
      options={availabilityFilterOptions}
      filterFn={filterFn}
      selected={selected}
      sortDirection={sortDirection}
      isOpen={isOpen}
      onSortClick={onSortClick}
      onToggleClick={onToggleClick}
      onOptionSelect={onOptionSelect}
    />
  );
}) as AvailabilityFilterComponent;

AvailabilityFilter.displayName = "AvailabilityFilter";

AvailabilityFilter.renderCell = (row: SenderResultData) => {
  if (!row || !row.availability) return "N/A";
  return formatDate(row.availability);
};

export default AvailabilityFilter;