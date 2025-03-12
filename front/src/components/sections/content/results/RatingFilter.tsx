// File: src/components/sections/content/results/RatingFilter.tsx
// Last modified: March 12, 2025
import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import BaseFilter from "./BaseFilter";
import { SenderResultData } from "./result-table.component";

interface RatingFilterProps {
  data: SenderResultData[];
  onFilter: (filtered: SenderResultData[]) => void;
}

const ratingFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "4.5", label: "4,5 and more" },
  { value: "4.0", label: "4,0 and more" },
  { value: "3.5", label: "3,5 and more" },
];

// Define the component type with static renderCell
interface RatingFilterComponent
  extends ForwardRefExoticComponent<
    RatingFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>
  > {
  renderCell?: (row: SenderResultData) => React.ReactNode;
}

const RatingFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  RatingFilterProps
>(({ data, onFilter }, ref) => {
  const filterFn = (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    const thresholdRating = parseFloat(selected);
    return data.filter(record => record.rating !== undefined && record.rating >= thresholdRating);
  };

  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label="Rating"
      options={ratingFilterOptions}
      filterFn={filterFn}
      className="dropfilter-rating"
    />
  );
}) as RatingFilterComponent;

RatingFilter.displayName = "RatingFilter";

RatingFilter.renderCell = (row: SenderResultData) =>
  row.rating !== undefined ? `★ ${row.rating.toFixed(1)}` : "★ N/A";

export default RatingFilter;