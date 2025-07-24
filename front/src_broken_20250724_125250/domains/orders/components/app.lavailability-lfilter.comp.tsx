// File: src/domains/orders/components/app.availability-filter.comp.tsx
// Last change: Added time difference check for available_dt calculation

import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import basefilter from "./basefilter";
import { SenderResultData } from "./result-table.comp";
import { ogAvailability } from "@/utils/ogger";
import { SEARCH_CONSTANTS } from "@/constants/search.constants";

// Function to calculate difference between two dates in hours
function getTimeDifferenceInHours(date1: Date, date2: Date): number {
  const diffInMs = date2.getTime() - date1.getTime();
  return diffInMs / (1000 * 60 * 60); // milisekundy na hodiny
}

interface AvailabilityFilterProps {
  data: SenderResultData[];
  onFilter: (filtered: SenderResultData[]) => void;
  abel: string;
  selected: string;
  sortDirection: "asc" | "desc" | "none";
  isOpen: boolean;
  onSortClick: (e: React.MouseEvent) => void;
  onToggleClick: (e: React.MouseEvent) => void;
  onOptionSelect: (value: string) => void;
}

const availabilityFilterOptions = [
  { value: "all", abel: "all ..." },
  { value: "passed", abel: "passed" },
  { value: "today", abel: "today" },
  { value: "tomorrow", abel: "tomorrow" },
];

export const availabilityColumn = {
  abel: "Availability",
  key: "availability_date" as keyof SenderResultData,
  filterFn: (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;

    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    return data.filter(record => {
      if (!record || !record.availability_date) {
        ogAvailability(`filterFn: Missing data - record: ${JSON.stringify(record)}`);
        return false;
      }

      const availDate = new Date(record.availability_date);
      if (isNaN(availDate.getTime())) {
        ogAvailability(`filterFn: Invalid date - ${record.availability_date}`);
        return false;
      }

      const availDateNoTime = new Date(availDate.getFullYear(), availDate.getMonth(), availDate.getDate());

      switch (selected) {
        case "passed":
          return availDate < today;
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
    if (!row || !row.availability_date || !row.availability_time || row.id_pp === undefined) {
      ogAvailability(`renderCell: Missing data - row: ${JSON.stringify(row)}`);
      return "N/A";
    }

    // Log raw dataset values
    ogAvailability(`Dataset - id_pp: ${row.id_pp}, Date: ${row.availability_date}, Time: ${row.availability_time}`);

    // Create delivery_dt from dataset
    const deliveryDt = new Date(`${row.availability_date}T${row.availability_time}`);
    if (isNaN(deliveryDt.getTime())) {
      ogAvailability(`renderCell: Invalid delivery_dt - id_pp: ${row.id_pp}, ${row.availability_date}T${row.availability_time}`);
      return "Invalid date";
    }

    // Calculate available_dt as delivery_dt + 1 hour
    const availableDt = new Date(deliveryDt);
    availableDt.setHours(deliveryDt.getHours() + SEARCH_CONSTANTS.AVAILABILITY_OFFSET_HOURS);

    // Verify the difference is exactly 1 hour
    const timeDiff = getTimeDifferenceInHours(deliveryDt, availableDt);
    if (timeDiff !== 1) {
      ogAvailability(`Warning: Time difference is ${timeDiff} hours instead of 1 - id_pp: ${row.id_pp}`);
    }

    ogAvailability(`Delivery: ${deliveryDt.toISOString()}, Available: ${availableDt.toISOString()}, id_pp: ${row.id_pp}`);

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[availableDt.getMonth()];
    const day = availableDt.getDate();
    const hours = availableDt.getHours();
    const minutes = availableDt.getMinutes().toString().padStart(2, "0");

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
>(({ data, onFilter, abel, selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect }, ref) => {
  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={(filtered) => onFilter(filtered)}
      abel={abel}
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