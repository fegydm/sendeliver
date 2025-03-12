// File: src/components/sections/content/results/AvailabilityFilter.tsx
// Last modified: March 12, 2025
import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import BaseFilter from "./BaseFilter";
import { SenderResultData } from "./result-table.component";

interface AvailabilityFilterProps {
  data: SenderResultData[];
  onFilter: (filtered: SenderResultData[]) => void;
}

const availabilityFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "passed", label: "passed" },
  { value: "today", label: "today" },
  { value: "tomorrow", label: "tomorrow" },
];

// Define the component type with static renderCell
interface AvailabilityFilterComponent
  extends ForwardRefExoticComponent<
    AvailabilityFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>
  > {
  renderCell?: (row: SenderResultData) => React.ReactNode;
}

const AvailabilityFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  AvailabilityFilterProps
>(({ data, onFilter }, ref) => {
  const filterFn = (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    return data.filter(record => {
      const availDate = new Date(record.availabilityTime);
      const now = new Date();
      if (selected === "passed") return availDate < now;
      if (selected === "today") return availDate.toDateString() === now.toDateString();
      if (selected === "tomorrow") {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        return availDate.toDateString() === tomorrow.toDateString();
      }
      return true;
    });
  };

  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label="Availability"
      options={availabilityFilterOptions}
      filterFn={filterFn}
      className="dropfilter-availability"
    />
  );
}) as AvailabilityFilterComponent;

AvailabilityFilter.displayName = "AvailabilityFilter";

AvailabilityFilter.renderCell = (row: SenderResultData) => {
  const availDate = new Date(row.availabilityTime);
  return isNaN(availDate.getTime()) ? "N/A" : availDate.toLocaleDateString();
};

export default AvailabilityFilter;