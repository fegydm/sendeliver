// File: src/components/sections/content/results/StatusFilter.tsx
// Last modified: March 13, 2025 - Added special handling for placeholder status

import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import BaseFilter from "./BaseFilter";
import { SenderResultData } from "./result-table.component";
import truckIcon from "@/assets/truck.svg";
import vanIcon from "@/assets/van.svg";
import lorryIcon from "@/assets/lorry.svg";
import rigidIcon from "@/assets/rigid.svg";

interface StatusFilterProps {
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

const vehicleIcons: { [key: string]: string } = {
  truck: truckIcon,
  van: vanIcon,
  lorry: lorryIcon,
  rigid: rigidIcon,
};

const getStatusValue = (record: SenderResultData): string => {
  if (!record || !record.availability) return "R";
  
  const now = new Date();
  const availTime = new Date(record.availability);
  
  // Default loading time is now + 2 hours if transit not available
  let loadingTime: Date;
  if (record.transit) {
    // Check if transit is already a calculation string like "2,5"
    if (typeof record.transit === 'string' && record.transit.includes(',')) {
      // For placeholder data, always return "O" (orange) status
      return "O";
    }
    
    loadingTime = new Date(record.transit);
    if (isNaN(loadingTime.getTime())) {
      loadingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    }
  } else {
    loadingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  }
  
  // G - availability time minus now is negative (available now)
  if (availTime < now) return "G";
  
  // O - availability time minus loading time is negative (available as scheduled)
  if (availTime < loadingTime) return "O";
  
  // R - availability time minus loading time is positive (available later)
  return "R";
};

const statusFilterOptions = [
  { value: "all", label: "all ...", icon: null },
  { 
    value: "G", 
    label: "(green) available now", 
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><circle cx='8' cy='8' r='7' fill='%2300CC00' /></svg>" 
  },
  { 
    value: "O", 
    label: "(orange) available as scheduled", 
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><circle cx='8' cy='8' r='7' fill='%23FFA500' /></svg>" 
  },
  { 
    value: "R", 
    label: "(red) available later", 
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><circle cx='8' cy='8' r='7' fill='%23FF0000' /></svg>" 
  },
];

// Define the component type with static renderCell
interface StatusFilterComponent extends ForwardRefExoticComponent<StatusFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>> {
  renderCell?: (row: SenderResultData) => React.ReactNode;
}

const StatusFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  StatusFilterProps
>(({ data, onFilter, label, selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect }, ref) => {
  const filterFn = (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    return data.filter(record => getStatusValue(record) === selected);
  };

  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label={label}
      options={statusFilterOptions}
      filterFn={filterFn}
      selected={selected}
      sortDirection={sortDirection}
      isOpen={isOpen}
      onSortClick={onSortClick}
      onToggleClick={onToggleClick}
      onOptionSelect={onOptionSelect}
    />
  );
}) as StatusFilterComponent;

StatusFilter.displayName = "StatusFilter";

StatusFilter.renderCell = (row: SenderResultData) => {
  // For placeholder data with transit as "2,5", force orange status
  if (typeof row.transit === 'string' && row.transit.includes(',')) {
    const statusColor = "#FFA500"; // Orange
    const vehicleType = (row?.type || "truck").toLowerCase();
    const vehicleIcon = vehicleIcons[vehicleType] || truckIcon;
    
    return (
      <div>
        <img 
          src={vehicleIcon} 
          alt={vehicleType}
          style={{ 
            width: "24px", 
            height: "24px",
            filter: `drop-shadow(0 0 3px ${statusColor})`,
            fill: statusColor
          }} 
        />
      </div>
    );
  }

  // Default status calculation for non-placeholder data
  const statusVal = getStatusValue(row);
  let statusColor = "#999999";
  
  switch (statusVal) {
    case "G": statusColor = "#00CC00"; break;
    case "O": statusColor = "#FFA500"; break;
    case "R": statusColor = "#FF0000"; break;
  }
  
  // Use type from SenderResultData, lowercase it for matching
  const vehicleType = (row?.type || "truck").toLowerCase();
  // Find matching icon or default to truck
  const vehicleIcon = vehicleIcons[vehicleType] || truckIcon;
  
  return (
    <div>
      <img 
        src={vehicleIcon} 
        alt={vehicleType}
        style={{ 
          width: "24px", 
          height: "24px",
          filter: `drop-shadow(0 0 3px ${statusColor})`,
          fill: statusColor
        }} 
      />
    </div>
  );
};

export default StatusFilter;