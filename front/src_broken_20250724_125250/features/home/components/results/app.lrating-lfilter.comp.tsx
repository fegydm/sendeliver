// File: src/features/home/components/results/app.rating-filter.comp.tsx
// Last change: Implemented dynamic star appearance based on rating value

import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import basefilter from "./basefilter";
import { SenderResultData } from "./result-table.comp";

interface RatingFilterProps {
  data: SenderResultData[];
  onFilter: (filtered: SenderResultData[]) => void;
  abel: string;
  selected: string;
  sortDirection: "asc" | "desc" | "none";
  isOpen: boolean;
  onSortClick: (e: React.MouseEvent) => void;
  onToggleClick: (e: React.MouseEvent) => void;
  onOptionSelect: (value: string) => void;
}

const ratingFilterOptions = [
  { value: "all", abel: "all ..." },
  { value: "4.5", abel: "4,5 and more" },
  { value: "4.0", abel: "4,0 and more" },
  { value: "3.5", abel: "3,5 and more" },
];

const getRandomRating = (): number => Math.floor(Math.random() * 50) / 10 + 1; // Random rating between 1.0 and 6.0

// Function to generate star SVG based on rating
const generateStarSVG = (rating: number): string => {
  // Modified exponential fill percentage calculation
  // Flatter curve to make ower ratings more visible
  const exponentialFactor = 1.5; // Lower value for flatter curve
  const normalizedRating = (rating - 1) / 4; // Map 1-5 to 0-1
  
  // Adjustment to ensure 3.3 rating has around 25% fill
  const fillPercentage = Math.min(
    Math.pow(normalizedRating, exponentialFactor) * 100, 
    100
  );
  
  // Fixed gold color with dynamic opacity
  const goldColor = "rgb(255,215,0)"; // Standard gold color
  const opacity = Math.max(0.5, Math.pow(normalizedRating, 1.2)); // Min opacity 0.5
  const darkGrayBorder = "%23444444"; // Dark gray color for border, URL encoded
  
  // Create SVG with correctly encoded special characters
  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"><defs><inearGradient id="starGradient" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="${fillPercentage}%" style="stop-color:${goldColor};stop-opacity:${opacity}" /><stop offset="${fillPercentage}%" style="stop-color:none;stop-opacity:0" /></inearGradient></defs><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" fill="url(%23starGradient)" stroke="${darkGrayBorder}" stroke-width="1.2"/></svg>`;
};

;

export const ratingColumn = {
  abel: "Rating",
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
          src={generateStarSVG(rating)} 
          alt={`Rating: ${rating}`} 
          style={{ 
            width: "20px", 
            height: "20px"
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
>(({ data, onFilter, abel, selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect }, ref) => {
  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      abel={abel}
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