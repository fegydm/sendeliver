// File: src/components/sections/content/results/TransitFilter.tsx
// Last modified: March 13, 2025 - Updated transit calculation to include distance

import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import BaseFilter from "./BaseFilter";
import { SenderResultData } from "./result-table.component";

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

// Helper function to calculate transit time in hours
const calculateTransitHours = (row: SenderResultData): number => {
  if (!row || !row.availability) return 0;
  
  // Get current date and time
  const now = new Date();
  
  // Get availability time
  const availTime = new Date(row.availability);
  if (isNaN(availTime.getTime())) return 0;
  
  // Only consider positive difference (future availability)
  const timeDiffMinutes = availTime > now 
    ? (availTime.getTime() - now.getTime()) / (1000 * 60) 
    : 0;
  
  // Get distance in km (assuming it's stored as a string like "40km" or "40")
  let distanceKm = 0;
  if (row.distance) {
    // Extract numbers from distance string
    const distanceMatch = row.distance.toString().match(/\d+(\.\d+)?/);
    if (distanceMatch) {
      distanceKm = parseFloat(distanceMatch[0]);
    }
  }
  
  // Calculate distance time (1km = 1 minute)
  const distanceMinutes = distanceKm;
  
  // Total transit time in minutes
  const totalTransitMinutes = timeDiffMinutes + distanceMinutes;
  
  // Convert to hours
  return totalTransitMinutes / 60;
};

// Helper function to format hours as "X,Y hrs"
const formatTransitTime = (hours: number): string => {
  if (hours === 0) return "0 hrs";
  
  // Format with one decimal place and replace dot with comma
  return hours.toFixed(1).replace('.', ',') + " hrs";
};

// Define the component type with static renderCell
interface TransitFilterComponent
  extends ForwardRefExoticComponent<
    TransitFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>
  > {
  renderCell?: (row: SenderResultData) => React.ReactNode;
}

const TransitFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  TransitFilterProps
>(({ data, onFilter, label, selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect }, ref) => {
  const filterFn = (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    
    const thresholdHours = parseFloat(selected);
    return data.filter(record => {
      const transitHours = calculateTransitHours(record);
      return transitHours <= thresholdHours && transitHours > 0;
    });
  };

  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label={label}
      options={transitFilterOptions}
      filterFn={filterFn}
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

TransitFilter.renderCell = (row: SenderResultData) => {
  const transitHours = calculateTransitHours(row);
  return formatTransitTime(transitHours);
};

export default TransitFilter;