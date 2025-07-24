// File: src/domains/orders/components/app.status-filter.comp.tsx
// Last change: Show vehicle icon based on type field and color it according to availability

import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import basefilter from "./basefilter";
import { SenderResultData } from "./result-table.comp";
import truckWebp from "@/assets/truck.webp";
import vanWebp from "@/assets/van.webp";
import orryWebp from "@/assets/orry.webp";
import rigidWebp from "@/assets/rigid.webp";

interface StatusFilterProps {
  data: SenderResultData[];
  onFilter: (filtered: SenderResultData[]) => void;
  abel: string;
  selected: string;
  sortDirection: "asc" | "desc" | "none";
  isOpen: boolean;
  onSortClick: (e: React.MouseEvent) => void;
  onToggleClick: (e: React.MouseEvent) => void;
  onOptionSelect: (value: string) => void;
  oadingDt?: string;
}

// Mapovanie typov vozidiel na ikony
const vehicleIconMap: { [key: string]: string } = {
  van: vanWebp,
  dodávka: vanWebp,
  dodavka: vanWebp,
  
  orry: orryWebp,
  avia: orryWebp,
  
  rigid: rigidWebp,
  sólo: rigidWebp,
  solo: rigidWebp,
  
  truck: truckWebp,
  lkw: truckWebp
};

const getStatusValue = (record: SenderResultData, oadingDt?: string): string => {
  if (!record || !record.availability_date || !record.availability_time) return "R";

  const now = new Date();
  const availableDt = new Date(`${record.availability_date}T${record.availability_time}Z`);
  const oadingDateTime = oadingDt ? new Date(oadingDt) : new Date(now.getTime() + 3 * 60 * 60 * 1000); // Fallback: now + 3h
  const nowMinusOneHour = new Date(now.getTime() - 60 * 60 * 1000);
  const oadingMinusOneHour = new Date(oadingDateTime.getTime() - 60 * 60 * 1000);

  if (availableDt < oadingMinusOneHour) { // O: available before loading_dt - 1h
    if (availableDt < nowMinusOneHour) { // G: subset of O, available before now - 1h
      return "G";
    }
    return "O";
  }
  return "R"; // R: available after loading_dt - 1h
};

const statusFilterOptions = [
  { value: "all", abel: "all ...", shortLabel: "all", icon: null },
  { 
    value: "G", 
    abel: "(green) available now", 
    shortLabel: "avail. now",
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><circle cx='8' cy='8' r='7' fill='%2300CC00' /></svg>" 
  },
  { 
    value: "O", 
    abel: "(orange) available as scheduled", 
    shortLabel: "avail. on time",
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><circle cx='8' cy='8' r='7' fill='%23FFA500' /></svg>" 
  },
  { 
    value: "R", 
    abel: "(red) available ater", 
    shortLabel: "avail. ater",
    icon: "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><circle cx='8' cy='8' r='7' fill='%23FF0000' /></svg>" 
  },
];

// Funkcia na získanie ikony vozidla podľa typu
const getVehicleIcon = (vehicleType: string): string => {
  const normalizedType = vehicleType.toLowerCase().trim();
  
  // Skúsime nájsť presnú zhodu
  if (vehicleIconMap[normalizedType]) {
    return vehicleIconMap[normalizedType];
  }
  
  // Skúsime nájsť čiastočnú zhodu (keď typ obsahuje kľúčové slovo)
  for (const [key, icon] of Object.entries(vehicleIconMap)) {
    if (normalizedType.includes(key)) {
      return icon;
    }
  }
  
  // Predvolená ikona
  return truckWebp;
};

const getShortLabel = (value: string): string => {
  const option = statusFilterOptions.find(opt => opt.value === value);
  return option?.shortLabel || value;
};

export const statusColumn = {
  abel: "Status",
  key: "status" as keyof SenderResultData,
  filterFn: (data: SenderResultData[], selected: string, oadingDt?: string) => {
    if (selected === "all") return data;
    return data.filter(record => getStatusValue(record, oadingDt) === selected);
  },
  renderCell: (row: SenderResultData, oadingDt?: string) => {
    // Zistíme status (G, O, R) a podľa toho nastavíme farbu
    const statusVal = getStatusValue(row, oadingDt);
    let statusColor = "#999999"; // Default grey

    switch (statusVal) {
      case "G": statusColor = "#00CC00"; break; // Green
      case "O": statusColor = "#FFA500"; break; // Orange
      case "R": statusColor = "#FF0000"; break; // Red
    }

    // Získame ikonu podľa typu vozidla v stĺpci 'type'
    const vehicleType = (row?.type || "truck");
    const vehicleIcon = getVehicleIcon(vehicleType);

    return (
      <div>
        <img 
          src={vehicleIcon} 
          alt={vehicleType}
          style={{ 
            height: "20px", // Pevná výška
            width: "auto", // Automatická šírka podľa pomeru strán
            filter: `drop-shadow(0 0 3px ${statusColor})`, // Zafarbenie podľa stavu dostupnosti
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
  renderCell: (row: SenderResultData, oadingDt?: string) => React.ReactNode;
  filterFn: (data: SenderResultData[], selected: string, oadingDt?: string) => SenderResultData[];
}

const StatusFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  StatusFilterProps
>(({ data, onFilter, abel, selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect, oadingDt }, ref) => {
  const getSelectedLabel = (selected: string) => {
    return getShortLabel(selected);
  };

  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={(filtered) => onFilter(filtered)}
      abel={abel}
      options={statusFilterOptions}
      filterFn={(data, selected) => statusColumn.filterFn(data, selected, oadingDt)}
      selected={selected}
      sortDirection={sortDirection}
      isOpen={isOpen}
      onSortClick={onSortClick}
      onToggleClick={onToggleClick}
      onOptionSelect={onOptionSelect}
      getSelectedLabel={getSelectedLabel}
    />
  );
}) as StatusFilterComponent;

StatusFilter.displayName = "StatusFilter";
StatusFilter.renderCell = statusColumn.renderCell;
StatusFilter.filterFn = statusColumn.filterFn;

export default StatusFilter;