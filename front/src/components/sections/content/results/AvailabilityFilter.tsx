// File: .front/src/components/sections/content/results/AvailabilityFilter.tsx
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

export const availabilityColumn = {
  label: "Availability",
  key: "availability" as const,
  filterFn: (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    
    return data.filter(record => {
      if (!record || !record.availability) return false;
      
      const availDate = new Date(record.availability);
      if (isNaN(availDate.getTime())) return false;
      
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      
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
  },
  renderCell: (row: SenderResultData) => {
    if (!row || !row.availability) return "N/A";
    const date = new Date(row.availability);
    if (isNaN(date.getTime())) return "Invalid date";
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${month} ${day}, ${hours}:${minutes}`;
  },
};

interface AvailabilityFilterComponent
  extends ForwardRefExoticComponent<
    AvailabilityFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>
  > {
  renderCell: (row: SenderResultData) => React.ReactNode;
  filterFn: (data: SenderResultData[], selected: string) => SenderResultData[];
}

const AvailabilityFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  AvailabilityFilterProps
>(({ data, onFilter, label, selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect }, ref) => {
  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label={label}
      options={availabilityFilterOptions}
      filterFn={availabilityColumn.filterFn}
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
AvailabilityFilter.renderCell = availabilityColumn.renderCell;
AvailabilityFilter.filterFn = availabilityColumn.filterFn;

export default AvailabilityFilter;