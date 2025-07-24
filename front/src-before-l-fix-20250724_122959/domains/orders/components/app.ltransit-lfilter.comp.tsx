// File: src/domains/orders/components/app.ltransit-lfilter.comp.tsx
// Last change: Updated transit calculation to work with availability time

import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import basefilter from "./basefilter";
import { SenderResultData } from "./result-table.comp";
import { SEARCH_CONSTANTS } from "@/constants/search.constants";

interface TransitFilterProps {
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

const transitFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "1", label: "up to 1 hr" },
  { value: "2", label: "up to 2 hrs" },
  { value: "5", label: "up to 5 hrs" },
];

const calculateTransitHours = (row: SenderResultData): number => {
  if (!row || !row.availability_date || !row.availability_time) {
    console.warn(`Transit calculation: Missing data for row`, row);
    return 0;
  }
  
  // Parse distance
  let distanceKm = 0;
  if (row.distance) {
    const distanceMatch = row.distance.toString().match(/\d+(\.\d+)?/);
    if (distanceMatch) {
      distanceKm = parseFloat(distanceMatch[0]);
    }
  }
  
  // Convert distance to minutes (1km = 1min, assuming 60km/h average speed)
  const distanceMinutes = distanceKm;
  
  // Get availability time from the same source as AvailabilityFilter
  try {
    // Create delivery_dt from dataset
    const deliveryDt = new Date(`${row.availability_date}T${row.availability_time}`);
    if (isNaN(deliveryDt.getTime())) {
      console.warn(`Transit calculation: Invalid delivery_dt - ${row.availability_date}T${row.availability_time}`);
      return distanceMinutes / 60; // Fallback to just distance-based transit time
    }

    // Calculate available_dt as delivery_dt + offset hours (same as in AvailabilityFilter)
    const availableDt = new Date(deliveryDt);
    availableDt.setHours(deliveryDt.getHours() + SEARCH_CONSTANTS.AVAILABILITY_OFFSET_HOURS);
    
    // Get loading time - either from the form data or use default offset
    // In this case, we assume it's not directly available and use the default offset
    const now = new Date();
    const loadingDt = new Date(now);
    loadingDt.setHours(now.getHours() + SEARCH_CONSTANTS.DEFAULT_LOADING_TIME_OFFSET_HOURS);
    
    // Calculate time difference in minutes
    const timeDiffMinutes = (loadingDt.getTime() - availableDt.getTime()) / (1000 * 60);
    
    let transitMinutes = 0;
    
    if (timeDiffMinutes >= 0) {
      // If loading time is after or equal to availability time
      // Transit time is just the distance in minutes
      transitMinutes = distanceMinutes;
      console.log(`Transit calculation: loading after availability - distance only: ${transitMinutes/60} hours`);
    } else {
      // If loading time is before availability time
      // Transit time is distance in minutes plus the wait time (absolute value of negative difference)
      transitMinutes = distanceMinutes + Math.abs(timeDiffMinutes);
      console.log(`Transit calculation: loading before availability - distance + wait time: ${transitMinutes/60} hours`);
    }
    
    // Convert to hours and return
    return transitMinutes / 60;
  } catch (e) {
    console.error(`Transit calculation error:`, e);
    return distanceMinutes / 60; // Fallback to just distance-based transit time
  }
};

const formatTransitTime = (hours: number): string => {
  if (hours === 0) return "0 hrs";
  return hours.toFixed(1).replace('.', ',') + " hrs";
};

export const transitColumn = {
  label: "Transit",
  key: "transit" as const,
  filterFn: (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    const thresholdHours = parseFloat(selected);
    return data.filter(record => {
      const transitHours = calculateTransitHours(record);
      return transitHours <= thresholdHours && transitHours > 0;
    });
  },
  renderCell: (row: SenderResultData) => formatTransitTime(calculateTransitHours(row)),
};

interface TransitFilterComponent
  extends ForwardRefExoticComponent<
    TransitFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>
  > {
  renderCell: (row: SenderResultData) => React.ReactNode;
  filterFn: (data: SenderResultData[], selected: string) => SenderResultData[];
}

const TransitFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  TransitFilterProps
>(({ data, onFilter, label, selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect }, ref) => {
  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label={label}
      options={transitFilterOptions}
      filterFn={transitColumn.filterFn}
      selected={selected}
      sortDirection={sortDirection}
      isOpen={isOpen}
      onSortClick={onSortClick}
      onToggleClick={onToggleClick}
      onOptionSelect={onOptionSelect}
    />
  );
}) as TransitFilterComponent;

TransitFilter.displayName = "TransitFilter";
TransitFilter.renderCell = transitColumn.renderCell;
TransitFilter.filterFn = transitColumn.filterFn;

export default TransitFilter;