// File: src/components/sections/content/results/DistanceFilter.tsx
// Last modified: March 12, 2025
import { forwardRef } from "react";
import BaseFilter from "./BaseFilter";
import { SenderResultData } from "./result-table.component";

interface DistanceFilterProps {
  data: SenderResultData[];
  onFilter: (filtered: SenderResultData[]) => void;
}

const distanceFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "20", label: "up to 20km" },
  { value: "50", label: "up to 50km" },
  { value: "100", label: "up to 100km" },
  { value: "200", label: "up to 200km" },
];

const DistanceFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  DistanceFilterProps
>(({ data, onFilter }, ref) => {
  const filterFn = (data: SenderResultData[], selected: string) => {
    const threshold = parseFloat(selected);
    return data.filter(record => {
      const distanceNum = parseFloat(record.distance);
      return !isNaN(distanceNum) && distanceNum < threshold;
    });
  };

  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label="Distance"
      options={distanceFilterOptions}
      filterFn={filterFn}
      className="dropfilter-distance"
    />
  );
});

DistanceFilter.displayName = "DistanceFilter";

export default DistanceFilter;