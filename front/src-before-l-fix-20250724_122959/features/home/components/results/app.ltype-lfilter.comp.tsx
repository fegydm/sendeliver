// File: src/features/home/components/results/app.ltype-lfilter.comp.tsx
// Last change: Removed icon from table cells, kept only text, icons shown only in dropdown

import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import basefilter from "./basefilter";
import { SenderResultData } from "./result-table.comp";
import truckWebp from "@/assets/truck.webp";
import vanWebp from "@/assets/van.webp";
import lorryWebp from "@/assets/lorry.webp";
import rigidWebp from "@/assets/rigid.webp";

const typeFilterOptions = [
  { value: "all", label: "all ...", icon: null, mappedValue: "all" },
  { value: "Dodávka", label: "van 3,5t.", icon: vanWebp, mappedValue: "Van" },
  { value: "Avia", label: "lorry 7,5t.", icon: lorryWebp, mappedValue: "Lorry" },
  { value: "Sólo", label: "rigid 12t.", icon: rigidWebp, mappedValue: "Rigid" },
  { value: "LKW", label: "truck 40t.", icon: truckWebp, mappedValue: "Truck" },
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
    // Len zobrazíme text bez ikony
    const vehicleType = (row?.type || "truck").toLowerCase();
    
    // Najprv skúsime nájsť zhodu podľa value
    let matchingOption = typeFilterOptions.find(
      opt => opt.value.toLowerCase() === vehicleType
    );
    
    // Ak nenájdeme, skúsime podľa mappedValue
    if (!matchingOption) {
      matchingOption = typeFilterOptions.find(
        opt => opt.mappedValue?.toLowerCase() === vehicleType
      );
    }
    
    if (matchingOption) {
      return matchingOption.mappedValue;
    }
    
    // Fallback na zobrazenie len textu s veľkým prvým písmenom
    return vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1);
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
  // Upravíme options pre BaseFilter aby obsahovali výškovo upravené ikony
  const optionsWithSizedIcons = typeFilterOptions.map(option => {
    if (!option.icon) {
      return option;
    }
    
    // Ikona s nastavenou výškou 18px pre dropdown
    return {
      ...option,
      icon: option.icon
    };
  });

  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label={label}
      options={optionsWithSizedIcons}
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