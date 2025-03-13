// File: src/components/sections/content/results/TypeFilter.tsx
// Last modified: March 13, 2025 - Added icons to filter options and renderCell

import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import BaseFilter from "./BaseFilter";
import { SenderResultData } from "./result-table.component";
import truckIcon from "@/assets/truck.svg";
import vanIcon from "@/assets/van.svg";
import lorryIcon from "@/assets/lorry.svg";
import rigidIcon from "@/assets/rigid.svg";

// Define filter options with value from DB and mappedValue for filtering/display
const typeFilterOptions = [
  { value: "all", label: "all ...", icon: null, mappedValue: "all" },
  { value: "Dodávka", label: "van 3,5t.", icon: vanIcon, mappedValue: "Van" },
  { value: "Avia", label: "lorry 7,5t.", icon: lorryIcon, mappedValue: "Lorry" },
  { value: "Sólo", label: "rigid 12t.", icon: rigidIcon, mappedValue: "Rigid" },
  { value: "LKW", label: "truck 40t.", icon: truckIcon, mappedValue: "Truck" },
];

// Props interface for TypeFilter, extending required BaseFilter props
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

// Define component type with static renderCell method
interface TypeFilterComponent
  extends ForwardRefExoticComponent<
    TypeFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>
  > {
  renderCell?: (row: SenderResultData) => React.ReactNode;
}

// TypeFilter component with ref forwarding
const TypeFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  TypeFilterProps
>(({ data, onFilter, label, selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect }, ref) => {
  // Filter function using mappedValue for comparison
  const filterFn = (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    const selectedOption = typeFilterOptions.find(opt => opt.value === selected);
    const mappedValue = selectedOption?.mappedValue || "Truck"; // Fallback to "Truck"
    return data.filter(record => {
      // Safely handle missing type property
      const recordType = record?.type || "truck";
      
      // Check if the record's type matches either the DB value or the mappedValue
      return recordType.toLowerCase() === selectedOption?.value.toLowerCase() || 
             recordType.toLowerCase() === mappedValue.toLowerCase();
    });
  };

  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label={label}
      options={typeFilterOptions}
      filterFn={filterFn}
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

// Static renderCell method to display only mappedValue in table cell
TypeFilter.renderCell = (row: SenderResultData) => {
  // Safe access to type property with fallback
  const vehicleType = (row?.type || "truck").toLowerCase(); 
  
  // Find matching option based on raw value from BE or default to truck
  const matchingOption = typeFilterOptions.find(opt => 
    opt.value === vehicleType || opt.value.toLowerCase() === vehicleType
  );
  
  // If found by exact value match, use its mappedValue
  if (matchingOption) {
    return matchingOption.mappedValue;
  }
  
  // Otherwise try to match by mappedValue directly
  const mappedOption = typeFilterOptions.find(opt => 
    opt.mappedValue?.toLowerCase() === vehicleType
  );
  
  // Return the found mappedValue or default to capitalized vehicleType
  return mappedOption?.mappedValue || vehicleType.charAt(0).toUpperCase() + vehicleType.slice(1);
};

export default TypeFilter;