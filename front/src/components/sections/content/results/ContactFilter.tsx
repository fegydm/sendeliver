// File: src/components/sections/content/results/ContactFilter.tsx
// Last modified: March 12, 2025
import { forwardRef, ForwardRefExoticComponent, RefAttributes } from "react";
import BaseFilter from "./BaseFilter";
import { SenderResultData } from "./result-table.component";

interface ContactFilterProps {
  data: SenderResultData[];
  onFilter: (filtered: SenderResultData[]) => void;
}

const contactFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "verified", label: "verified" },
];

// Define the component type with static renderCell
interface ContactFilterComponent
  extends ForwardRefExoticComponent<
    ContactFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>
  > {
  renderCell?: (row: SenderResultData) => React.ReactNode;
}

const ContactFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  ContactFilterProps
>(({ data, onFilter }, ref) => {
  const filterFn = (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    return data.filter(record => selected === "verified" && record.pp > 0);
  };

  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label="Contact"
      options={contactFilterOptions}
      filterFn={filterFn}
      className="dropfilter-contact"
    />
  );
}) as ContactFilterComponent;

ContactFilter.displayName = "ContactFilter";

ContactFilter.renderCell = (row: SenderResultData) => (row.pp > 0 ? "Verified" : "Not Verified");

export default ContactFilter;