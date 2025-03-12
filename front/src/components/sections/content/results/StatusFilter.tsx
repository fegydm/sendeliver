// File: src/components/sections/content/results/StatusFilter.tsx
// Last modified: March 12, 2025
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
}

const vehicleIcons: { [key: string]: string } = {
  truck: truckIcon,
  van: vanIcon,
  lorry: lorryIcon,
  rigid: rigidIcon,
};

const getStatusValue = (record: SenderResultData): string => {
  const now = new Date();
  const availTime = new Date(record.availabilityTime);
  const loadingTime = new Date(record.eta);
  if (availTime < loadingTime && availTime < now) return "G";
  else if (availTime < loadingTime && availTime > now) return "O";
  else if (availTime > loadingTime) return "R";
  return "";
};

const statusFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "G", label: "Available Now" },
  { value: "O", label: "Scheduled" },
  { value: "R", label: "Later" },
];

// Define the component type with static renderCell
interface StatusFilterComponent extends ForwardRefExoticComponent<StatusFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>> {
  renderCell?: (row: SenderResultData) => React.ReactNode;
}

const StatusFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  StatusFilterProps
>(({ data, onFilter }, ref) => {
  const filterFn = (data: SenderResultData[], selected: string) => {
    return data.filter(record => getStatusValue(record) === selected);
  };

  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label="Status"
      options={statusFilterOptions}
      filterFn={filterFn}
      className="dropfilter-status"
    />
  );
}) as StatusFilterComponent;

StatusFilter.displayName = "StatusFilter";

StatusFilter.renderCell = (row: SenderResultData) => {
  const statusVal = getStatusValue(row);
  let statusColor = "grey";
  let statusText = "";
  switch (statusVal) {
    case "G": statusColor = "#00FF00"; statusText = "available now"; break;
    case "O": statusColor = "#FFA500"; statusText = "available as scheduled"; break;
    case "R": statusColor = "#FF0000"; statusText = "available later"; break;
  }
  const vehicleIcon = vehicleIcons[row.vehicleType.toLowerCase()] || truckIcon;
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      <img src={vehicleIcon} alt={`${row.vehicleType} Icon`} style={{ width: "24px", filter: `drop-shadow(0 0 0 ${statusColor})`, marginRight: "8px" }} />
      <span style={{ color: "grey" }}>{statusVal} - {statusText}</span>
    </div>
  );
};

export default StatusFilter;