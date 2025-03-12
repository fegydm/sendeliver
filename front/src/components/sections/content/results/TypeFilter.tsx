// File: src/components/sections/content/results/TypeFilter.tsx
// Last modified: March 12, 2025
import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import BaseFilter from "./BaseFilter";
import { SenderResultData } from "./result-table.component";
import truckIcon from "@/assets/truck.svg";
import vanIcon from "@/assets/van.svg";
import lorryIcon from "@/assets/lorry.svg";
import rigidIcon from "@/assets/rigid.svg";

// Define filter options with updated icons
const typeFilterOptions = [
  { value: "all", label: "all ...", icon: null },
  { value: "LKW", label: "truck 40t.", icon: truckIcon, mappedValue: "truck" },
  { value: "Sólo", label: "rigid 12t.", icon: rigidIcon, mappedValue: "rigid" },
  { value: "Dodávka", label: "van 3,5t.", icon: vanIcon, mappedValue: "van" },
  { value: "Avia", label: "lorry 7,5t.", icon: lorryIcon, mappedValue: "lorry" },
];

interface TypeFilterProps {
  data: SenderResultData[];
  onFilter: (filtered: SenderResultData[]) => void;
}

// Define the component type with static renderCell
interface TypeFilterComponent
  extends ForwardRefExoticComponent<
    TypeFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>
  > {
  renderCell?: (row: SenderResultData) => React.ReactNode;
}

const TypeFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  TypeFilterProps
>(({ data, onFilter }, ref) => {
  const filterFn = (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    const selectedOption = typeFilterOptions.find(opt => opt.value === selected);
    const mappedValue = selectedOption?.mappedValue || selected;
    return data.filter(record => record.vehicleType.toLowerCase() === mappedValue.toLowerCase());
  };

  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label="Type"
      options={typeFilterOptions}
      filterFn={filterFn}
      className="dropfilter-type"
    />
  );
}) as TypeFilterComponent;

TypeFilter.displayName = "TypeFilter";

TypeFilter.renderCell = (row: SenderResultData) => {
  const vehicleType = row.vehicleType.toLowerCase();
  const option = typeFilterOptions.find(opt => opt.mappedValue?.toLowerCase() === vehicleType);
  return option?.icon ? (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img src={option.icon} alt={option.label} style={{ width: "24px", marginRight: "8px" }} />
      <span>{option.label}</span>
    </div>
  ) : (
    vehicleType || "N/A"
  );
};

export default TypeFilter;