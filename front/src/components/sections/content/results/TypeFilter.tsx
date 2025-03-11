import React, { useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { getAnimatedArrow } from "@/utils/animateArrow";
import { SenderResultData } from "./result-table.component";
import truckIcon from "@/assets/truck.svg";
import vanIcon from "@/assets/van.svg";
import lorryIcon from "@/assets/lorry.svg";
import rigidIcon from "@/assets/rigid.svg";

// Define filter options with updated icons
const typeFilterOptions = [
  { value: "all", label: "all ...", icon: null },
  { value: "LKW", label: "truck 40t.", icon: truckIcon, mappedValue: "truck" },
  { value: "Sólo", label: "rigid 12t.", icon: rigidIcon, mappedValue: "rigid" },
  { value: "Dodávka", label: "van 3,5t.", icon: vanIcon, mappedValue: "van" },
  { value: "Avia", label: "lorry 7,5t.", icon: lorryIcon, mappedValue: "lorry" },
];

interface TypeFilterProps {
  data: SenderResultData[];
  onFilter: (filtered: SenderResultData[]) => void;
}

const TypeFilter = forwardRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }, TypeFilterProps>(
  ({ data, onFilter }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedType, setSelectedType] = useState("all");

    // Filter data based on selected vehicle type
    const filterData = () => {
      if (selectedType === "all") return data;
      const selectedOption = typeFilterOptions.find(opt => opt.value === selectedType);
      const mappedValue = selectedOption?.mappedValue || selectedType;
      return data.filter(record => record.vehicleType.toLowerCase() === mappedValue.toLowerCase());
    };

    useEffect(() => {
      const filtered = filterData();
      onFilter(filtered);
    }, [selectedType, data]);

    useImperativeHandle(ref, () => ({
      reset: () => setIsOpen(false), // Only closes dropdown, keeps selection
      isOpen: () => isOpen,
      isFiltered: () => selectedType !== "all",
    }));

    return (
      <div className="dropdown-type">
        <div
          className="dropdown-type__toggle"
          onClick={() => setIsOpen(prev => !prev)}
        >
          <span>
            {selectedType === "all"
              ? "Type"
              : typeFilterOptions.find(opt => opt.value === selectedType)?.label}
          </span>
          {getAnimatedArrow(isOpen)}
        </div>
        {isOpen && (
          <div className="dropdown-type__content">
            {typeFilterOptions.map((item, index) => (
              <div
                key={item.value}
                className={`dropdown-type__item ${index === 0 ? "dropdown__item--grey" : ""}`}
                onClick={() => {
                  setSelectedType(item.value);
                  setIsOpen(false);
                }}
                style={{ display: "flex", alignItems: "center" }}
              >
                {item.icon && (
                  <img src={item.icon} alt={item.label} style={{ width: "24px", marginRight: "8px" }} />
                )}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

TypeFilter.displayName = "TypeFilter";

export default TypeFilter;