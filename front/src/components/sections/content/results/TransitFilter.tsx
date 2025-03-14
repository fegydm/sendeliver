// File: src/components/sections/content/results/TransitFilter.tsx
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

const calculateTransitHours = (row: SenderResultData): number => {
  if (!row || !row.availability) return 0;
  
  const now = new Date();
  const availTime = new Date(row.availability);
  if (isNaN(availTime.getTime())) return 0;
  
  const timeDiffMinutes = availTime > now 
    ? (availTime.getTime() - now.getTime()) / (1000 * 60) 
    : 0;
  
  let distanceKm = 0;
  if (row.distance) {
    const distanceMatch = row.distance.toString().match(/\d+(\.\d+)?/);
    if (distanceMatch) {
      distanceKm = parseFloat(distanceMatch[0]);
    }
  }
  
  const distanceMinutes = distanceKm;
  const totalTransitMinutes = timeDiffMinutes + distanceMinutes;
  return totalTransitMinutes / 60;
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