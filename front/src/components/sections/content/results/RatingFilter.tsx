// File: src/components/sections/content/results/RatingFilter.tsx
import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import BaseFilter from "./BaseFilter";
import { SenderResultData } from "./result-table.component";

interface RatingFilterProps {
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

const ratingFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "4.5", label: "4,5 and more" },
  { value: "4.0", label: "4,0 and more" },
  { value: "3.5", label: "3,5 and more" },
];

const getRandomRating = (): number => Math.floor(Math.random() * 5) + 1;

const emptyStar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' fill='none' stroke='gold' stroke-width='1'/></svg>";
const halfStar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' fill='gold' fill-opacity='0.5' stroke='gold' stroke-width='1'/></svg>";
const fullStar = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z' fill='gold' stroke='gold' stroke-width='1'/></svg>";

const getStarImage = (rating: number): string => {
  if (rating <= 1) return emptyStar;
  if (rating <= 3) return halfStar;
  return fullStar;
};

export const ratingColumn = {
  label: "Rating",
  key: "rating" as const,
  filterFn: (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    const thresholdRating = parseFloat(selected.replace(',', '.'));
    return data.filter(record => {
      const rating = record.rating !== undefined && record.rating !== null ? 
        record.rating : getRandomRating();
      return rating >= thresholdRating;
    });
  },
  renderCell: (row: SenderResultData) => {
    const rating = row.rating !== undefined && row.rating !== null ? 
      row.rating : getRandomRating();
    return (
      <div style={{ display: "inline-flex", alignItems: "center" }}>
        <img 
          src={getStarImage(rating)} 
          alt={`Rating: ${rating}`} 
          style={{ 
            width: "20px", 
            height: "20px", 
            opacity: Math.max(0.2, rating / 5)
          }} 
        />
        <span style={{ marginLeft: "4px" }}>
          {rating.toFixed(1).replace('.', ',')}
        </span>
      </div>
    );
  },
};

interface RatingFilterComponent
  extends ForwardRefExoticComponent<
    RatingFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>
  > {
  renderCell: (row: SenderResultData) => React.ReactNode;
  filterFn: (data: SenderResultData[], selected: string) => SenderResultData[];
}

const RatingFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  RatingFilterProps
>(({ data, onFilter, label, selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect }, ref) => {
  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label={label}
      options={ratingFilterOptions}
      filterFn={ratingColumn.filterFn}
      selected={selected}
      sortDirection={sortDirection}
      isOpen={isOpen}
      onSortClick={onSortClick}
      onToggleClick={onToggleClick}
      onOptionSelect={onOptionSelect}
    />
  );
}) as RatingFilterComponent;

RatingFilter.displayName = "RatingFilter";
RatingFilter.renderCell = ratingColumn.renderCell;
RatingFilter.filterFn = ratingColumn.filterFn;

export default RatingFilter;