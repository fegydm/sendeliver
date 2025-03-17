import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import BaseFilter from "./BaseFilter";
import { SenderResultData } from "./result-table.component";
import { log, logAvailability } from "@/utils/logger"; // Import oboch loggerov

interface AvailabilityFilterProps {
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

const availabilityFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "passed", label: "passed" },
  { value: "today", label: "today" },
  { value: "tomorrow", label: "tomorrow" },
];

export const availabilityColumn = {
  label: "Availability",
  key: "availability_date" as keyof SenderResultData,
  filterFn: (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;

    return data.filter(record => {
      if (
        !record ||
        !record.availability_date ||
        record.availability_date === "N/A" ||
        !record.availability_time ||
        record.availability_time === "N/A"
      ) {
        logAvailability(
          `filterFn: Preskakujem záznam - chýbajúce alebo neplatné dáta - ` +
          `record: ${JSON.stringify(record)}, ` +
          `availability_date: ${record?.availability_date}, ` +
          `availability_time: ${record?.availability_time}`
        );
        return false;
      }

      const availDateTime = new Date(`${record.availability_date}T${record.availability_time}Z`);
      if (isNaN(availDateTime.getTime())) {
        logAvailability(
          `filterFn: Neplatný dátum - ` +
          `availability_date: ${record.availability_date}, ` +
          `availability_time: ${record.availability_time}, ` +
          `vytvorený reťazec: ${record.availability_date}T${record.availability_time}Z`
        );
        return false;
      }

      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const availDateNoTime = new Date(
        availDateTime.getFullYear(),
        availDateTime.getMonth(),
        availDateTime.getDate()
      );

      logAvailability(
        `filterFn: Spracovávam záznam - ` +
        `availDateTime: ${availDateTime.toISOString()}, ` +
        `selected: ${selected}, ` +
        `now: ${now.toISOString()}, ` +
        `today: ${today.toISOString()}, ` +
        `tomorrow: ${tomorrow.toISOString()}`
      );

      switch (selected) {
        case "passed":
          return availDateTime < now;
        case "today":
          return availDateNoTime.getTime() === today.getTime();
        case "tomorrow":
          return availDateNoTime.getTime() === tomorrow.getTime();
        default:
          return false;
      }
    });
  },
  renderCell: (row: SenderResultData) => {
    if (
      !row ||
      !row.availability_date ||
      row.availability_date === "N/A" ||
      !row.availability_time ||
      row.availability_time === "N/A"
    ) {
      logAvailability(
        `renderCell: Chýbajúce alebo neplatné dáta - ` +
        `row: ${JSON.stringify(row)}, ` +
        `availability_date: ${row?.availability_date}, ` +
        `availability_time: ${row?.availability_time}`
      );
      return "N/A";
    }

    const date = new Date(`${row.availability_date}T${row.availability_time}Z`);
    logAvailability(
      `renderCell: Vytváram dátum - ` +
      `availability_date: ${row.availability_date}, ` +
      `availability_time: ${row.availability_time}, ` +
      `vytvorený reťazec: ${row.availability_date}T${row.availability_time}Z, ` +
      `výsledný dátum: ${date.toISOString()}`
    );

    if (isNaN(date.getTime())) {
      logAvailability(
        `renderCell: Neplatný dátum - ` +
        `availability_date: ${row.availability_date}, ` +
        `availability_time: ${row.availability_time}`
      );
      return "Invalid date";
    }

    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const month = months[date.getMonth()];
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes().toString().padStart(2, "0");

    return `${month} ${day}, ${hours}:${minutes}`;
  },
};

interface AvailabilityFilterComponent
  extends ForwardRefExoticComponent<
    AvailabilityFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>
  > {
  renderCell: (row: SenderResultData) => React.ReactNode;
  filterFn: (data: SenderResultData[], selected: string) => SenderResultData[];
}

const AvailabilityFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  AvailabilityFilterProps
>(({ data, onFilter, label, selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect }, ref) => {
  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label={label}
      options={availabilityFilterOptions}
      filterFn={availabilityColumn.filterFn}
      selected={selected}
      sortDirection={sortDirection}
      isOpen={isOpen}
      onSortClick={onSortClick}
      onToggleClick={onToggleClick}
      onOptionSelect={onOptionSelect}
    />
  );
}) as AvailabilityFilterComponent;

AvailabilityFilter.displayName = "AvailabilityFilter";
AvailabilityFilter.renderCell = availabilityColumn.renderCell;
AvailabilityFilter.filterFn = availabilityColumn.filterFn;

export default AvailabilityFilter;