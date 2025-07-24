// File: src/domains/orders/components/app.ldistance-lfilter.comp.tsx
import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import BaseFilter from "./BaseFilter";
import { SenderResultData } from "./result-table.comp";

interface DistanceFilterProps {
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

const distanceFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "20", label: "up to 20 km" },
  { value: "50", label: "up to 50 km" },
  { value: "100", label: "up to 100 km" },
  { value: "200", label: "up to 200 km" },
];

export const distanceColumn = {
  label: "Distance",
  key: "distance" as const,
  filterFn: (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    const threshold = parseFloat(selected);
    if (isNaN(threshold)) return data;
    const filtered = data.filter(record => {
      if (!record || record.distance === undefined) return false;
      const distanceNum = record.distance;
      const passesFilter = distanceNum < threshold;
      console.log(`Filtering: distance=${distanceNum}, threshold=${threshold}, passes=${passesFilter}`);
      return passesFilter;
    });
    console.log("DistanceFilter filtered:", filtered);
    return filtered;
  },
  renderCell: (row: SenderResultData) => {
    if (!row || row.distance === undefined) return "N/A";
    return `${row.distance} km`;
  },
};

interface DistanceFilterComponent
  extends ForwardRefExoticComponent<
    DistanceFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>
  > {
  renderCell: (row: SenderResultData) => React.ReactNode;
  filterFn: (data: SenderResultData[], selected: string) => SenderResultData[];
}

const DistanceFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  DistanceFilterProps
>(({ data, onFilter, label, selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect }, ref) => {
  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label={label}
      options={distanceFilterOptions}
      filterFn={distanceColumn.filterFn}
      selected={selected}
      sortDirection={sortDirection}
      isOpen={isOpen}
      onSortClick={onSortClick}
      onToggleClick={onToggleClick}
      onOptionSelect={onOptionSelect}
    />
  );
}) as DistanceFilterComponent;

DistanceFilter.displayName = "DistanceFilter";
DistanceFilter.renderCell = distanceColumn.renderCell;
DistanceFilter.filterFn = distanceColumn.filterFn;

export default DistanceFilter;