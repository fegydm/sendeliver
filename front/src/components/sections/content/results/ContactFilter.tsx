// File: src/components/sections/content/results/ContactFilter.tsx
import { forwardRef, ForwardRefExoticComponent, RefAttributes, useState, useEffect, useRef } from "react";
import BaseFilter from "./BaseFilter";
import { SenderResultData } from "./result-table.component";

interface ContactFilterProps {
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

const contactFilterOptions = [
  { value: "all", label: "all ..." },
  { value: "verified", label: "verified" },
];

const CellWithHover = ({ id_pp, name_carrier }: { id_pp: number; name_carrier?: string }) => {
  const [showTooltip, setShowTooltip] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleMouseEnter = () => {
    timerRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 2000);
  };
  
  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setShowTooltip(false);
  };
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  return (
    <div 
      style={{ 
        position: "relative", 
        display: "inline-block",
        cursor: "default"
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <span>{name_carrier || `PP${id_pp}`}</span>
      {showTooltip && name_carrier && (
        <div style={{
          position: "absolute",
          bottom: "100%",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#333",
          color: "#fff",
          padding: "4px 8px",
          borderRadius: "4px",
          fontSize: "12px",
          whiteSpace: "nowrap",
          zIndex: 1000,
          boxShadow: "0 2px 5px rgba(0,0,0,0.2)"
        }}>
          {name_carrier}
        </div>
      )}
    </div>
  );
};

export const contactColumn = {
  label: "Contact",
  key: "contact" as const,
  filterFn: (data: SenderResultData[], selected: string) => {
    if (selected === "all") return data;
    return data.filter(record => {
      if (!record || record.contact === undefined) return false;
      return selected === "verified" && record.contact > 0;
    });
  },
  renderCell: (row: SenderResultData) => {
    if (!row || row.contact === undefined) return "N/A";
    if (row.name_carrier) return <CellWithHover id_pp={row.contact} name_carrier={row.name_carrier} />;
    const id_pp = row.contact;
    const name_carrier = `Carrier ${id_pp} Transport, Inc.`;
    return <CellWithHover id_pp={id_pp} name_carrier={name_carrier} />;
  },
};

interface ContactFilterComponent
  extends ForwardRefExoticComponent<
    ContactFilterProps & RefAttributes<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }>
  > {
  renderCell: (row: SenderResultData) => React.ReactNode;
  filterFn: (data: SenderResultData[], selected: string) => SenderResultData[];
}

const ContactFilter = forwardRef<
  { reset: () => void; isOpen: () => boolean; isFiltered: () => boolean },
  ContactFilterProps
>(({ data, onFilter, label, selected, sortDirection, isOpen, onSortClick, onToggleClick, onOptionSelect }, ref) => {
  return (
    <BaseFilter
      ref={ref}
      data={data}
      onFilter={onFilter}
      label={label}
      options={contactFilterOptions}
      filterFn={contactColumn.filterFn}
      selected={selected}
      sortDirection={sortDirection}
      isOpen={isOpen}
      onSortClick={onSortClick}
      onToggleClick={onToggleClick}
      onOptionSelect={onOptionSelect}
    />
  );
}) as ContactFilterComponent;

ContactFilter.displayName = "ContactFilter";
ContactFilter.renderCell = contactColumn.renderCell;
ContactFilter.filterFn = contactColumn.filterFn;

export default ContactFilter;