// File: src/components/sections/content/results/TransitFilter.tsx
// Last modified: March 12, 2025
import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import BaseFilter from "./BaseFilter";
import { SenderResultData } from "./result-table.component";

interface TransitFilterProps {
  data: SenderResultData[];
  onFilter: (filtered: SenderResultData[]) => void;
}

const transitFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "1", label: "up to 1 hr" },
  { value: "2", label: "up to 2 hrs" },
  { value: "5", label: "up to 5 hrs" },
];

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
>(({ data, onFilter }, ref) => {
  const filterFn = (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    const thresholdHours = parseFloat(selected);
    const now = new Date();
    return data.filter(record => {
      const etaDate = new Date(record.eta);
      const diffHours = (etaDate.getTime() - now.getTime()) / (1000 * 60 * 60);
      return diffHours <= thresholdHours;
    });
  };

  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label="Transit"
      options={transitFilterOptions}
      filterFn={filterFn}
      className="dropfilter-transit"
    />
  );
}) as TransitFilterComponent;

TransitFilter.displayName = "TransitFilter";

TransitFilter.renderCell = (row: SenderResultData) => {
  const etaDate = new Date(row.eta);
  return isNaN(etaDate.getTime()) ? "N/A" : etaDate.getHours().toString().padStart(2, "0") + ":00";
};

export default TransitFilter;