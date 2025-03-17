// File: src/components/sections/content/results/StatusFilter.tsx
// Last modified: March 26, 2025 - Added shortened labels for second row display

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
  
  let loadingTime: Date;
  if (record.transit) {
    if (typeof record.transit === 'string' && record.transit.includes(',')) {
      return "O";
    }
    
    loadingTime = new Date(record.transit);
    if (isNaN(loadingTime.getTime())) {
      loadingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
    }
  } else {
    loadingTime = new Date(now.getTime() + 2 * 60 * 60 * 1000);
  }
  
  if (availTime < now) return "G";
  if (availTime < loadingTime) return "O";
  return "R";
};

// Option definitions with both full and short labels
const statusFilterOptions = [
  { value: "all", label: "all ...", shortLabel: "all", icon: null },
  { 
    value: "G", 
    label: "(green) available now", 
    shortLabel: "avail. now",
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><circle cx='8' cy='8' r='7' fill='%2300CC00' /></svg>" 
  },
  { 
    value: "O", 
    label: "(orange) available as scheduled", 
    shortLabel: "avail. as scheduled",
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><circle cx='8' cy='8' r='7' fill='%23FFA500' /></svg>" 
  },
  { 
    value: "R", 
    label: "(red) available later", 
    shortLabel: "avail. later",
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><circle cx='8' cy='8' r='7' fill='%23FF0000' /></svg>" 
  },
];

// Function to get short label based on the selected value
const getShortLabel = (value: string): string => {
  const option = statusFilterOptions.find(opt => opt.value === value);
  return option?.shortLabel || value;
};

export const statusColumn = {
  label: "Status",
  key: "status" as const,
  filterFn: (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    return data.filter(record => getStatusValue(record) === selected);
  },
  renderCell: (row: SenderResultData) => {
    if (typeof row.transit === 'string' && row.transit.includes(',')) {
      const statusColor = "#FFA500";
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

    const statusVal = getStatusValue(row);
    let statusColor = "#999999";
    
    switch (statusVal) {
      case "G": statusColor = "#00CC00"; break;
      case "O": statusColor = "#FFA500"; break;
      case "R": statusColor = "#FF0000"; break;
    }
    
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
  },
};

interface StatusFilterComponent
  extends ForwardRefExoticComponent<
    StatusFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>
  > {
  renderCell: (row: SenderResultData) => React.ReactNode;
  filterFn: (data: SenderResultData[], selected: string) => SenderResultData[];
}

const StatusFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  StatusFilterProps
>(({ data, onFilter, label, selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect }, ref) => {
  // Replace standard BaseFilter options with options that include shortLabel
  const optionsWithShortLabels = statusFilterOptions.map(option => ({
    value: option.value,
    label: option.label,
    icon: option.icon
  }));

  // Create custom selected label formatter for second row display
  const getSelectedLabel = (selected: string) => {
    return getShortLabel(selected);
  };

  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label={label}
      options={optionsWithShortLabels}
      filterFn={statusColumn.filterFn}
      selected={selected}
      sortDirection={sortDirection}
      isOpen={isOpen}
      onSortClick={onSortClick}
      onToggleClick={onToggleClick}
      onOptionSelect={onOptionSelect}
      getSelectedLabel={getSelectedLabel} // Pass custom formatter to BaseFilter
    />
  );
}) as StatusFilterComponent;

StatusFilter.displayName = "StatusFilter";
StatusFilter.renderCell = statusColumn.renderCell;
StatusFilter.filterFn = statusColumn.filterFn;

export default StatusFilter;