// File: src/components/sections/content/results/TypeFilter.tsx
import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import BaseFilter from "./BaseFilter";
import { SenderResultData } from "./result-table.component";
import truckIcon from "@/assets/truck.svg";
import vanIcon from "@/assets/van.svg";
import lorryIcon from "@/assets/lorry.svg";
import rigidIcon from "@/assets/rigid.svg";

const typeFilterOptions = [
  { value: "all", label: "all ...", icon: null, mappedValue: "all" },
  { value: "Dodávka", label: "van 3,5t.", icon: vanIcon, mappedValue: "Van" },
  { value: "Avia", label: "lorry 7,5t.", icon: lorryIcon, mappedValue: "Lorry" },
  { value: "Sólo", label: "rigid 12t.", icon: rigidIcon, mappedValue: "Rigid" },
  { value: "LKW", label: "truck 40t.", icon: truckIcon, mappedValue: "Truck" },
];

export const typeColumn = {
  label: "Type",
  key: "type" as const,
  filterFn: (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    const selectedOption = typeFilterOptions.find(opt => opt.value === selected);
    const mappedValue = selectedOption?.mappedValue || "Truck";
    return data.filter(record => {
      const recordType = record?.type || "truck";
      return (
        recordType.toLowerCase() === selectedOption?.value.toLowerCase() ||
        recordType.toLowerCase() === mappedValue.toLowerCase()
      );
    });
  },
  renderCell: (row: SenderResultData) => {
    const vehicleType = (row?.type || "truck").toLowerCase();
    const matchingOption = typeFilterOptions.find(
      opt => opt.value === vehicleType || opt.value.toLowerCase() === vehicleType
    );
    if (matchingOption) return matchingOption.mappedValue;
    const mappedOption = typeFilterOptions.find(
      opt => opt.mappedValue?.toLowerCase() === vehicleType
    );
    return (
      mappedOption?.mappedValue ||
      vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1)
    );
  },
};

interface TypeFilterProps {
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

interface TypeFilterComponent
  extends ForwardRefExoticComponent<
    TypeFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>
  > {
  renderCell: (row: SenderResultData) => React.ReactNode;
  filterFn: (data: SenderResultData[], selected: string) => SenderResultData[];
}

const TypeFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  TypeFilterProps
>(({ data, onFilter, label, selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect }, ref) => {
  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label={label}
      options={typeFilterOptions}
      filterFn={typeColumn.filterFn}
      selected={selected}
      sortDirection={sortDirection}
      isOpen={isOpen}
      onSortClick={onSortClick}
      onToggleClick={onToggleClick}
      onOptionSelect={onOptionSelect}
    />
  );
}) as TypeFilterComponent;

TypeFilter.displayName = "TypeFilter";
TypeFilter.renderCell = typeColumn.renderCell;
TypeFilter.filterFn = typeColumn.filterFn;

export default TypeFilter;