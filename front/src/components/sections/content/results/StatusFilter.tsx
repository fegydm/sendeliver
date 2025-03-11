import React, { useState, useEffect, useRef, forwardRef, useImperativeHandle } from "react";
import { getAnimatedArrow } from "@/utils/animateArrow";
import { SenderResultData } from "./result-table.component";

interface StatusFilterProps {
  data: SenderResultData[];
  onFilter: (filtered: SenderResultData[]) => void;
}

const StatusFilter = forwardRef<{ reset: () => void; isOpen: () => boolean; isFiltered: () => boolean }, StatusFilterProps>(
  ({ data, onFilter }, ref) => {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("all");

    const options = [
      { value: "all", circleColor: "transparent", grayText: "", description: "all ..." },
      { value: "G", circleColor: "#00FF00", grayText: "(green)", description: "available now" },
      { value: "O", circleColor: "#FFA500", grayText: "(orange)", description: "available as scheduled" },
      { value: "R", circleColor: "#FF0000", grayText: "(red)", description: "available later" },
    ];

    useEffect(() => {
      const filtered = data.filter(record => {
        if (selectedStatus === "all") return true;
        const now = new Date();
        const availTime = new Date(record.availabilityTime);
        const loadingTime = new Date(record.eta);
        if (selectedStatus === "G") return availTime < loadingTime && availTime < now;
        if (selectedStatus === "O") return availTime < loadingTime && availTime > now;
        if (selectedStatus === "R") return availTime > loadingTime;
        return false;
      });
      onFilter(filtered);
    }, [data, selectedStatus, onFilter]);

    useImperativeHandle(ref, () => ({
      reset: () => setIsOpen(false),
      isOpen: () => isOpen,
      isFiltered: () => selectedStatus !== "all",
    }));

    return (
      <div className="dropdown-status">
        <div
          className="dropdown-status__toggle"
          onClick={() => setIsOpen(prev => !prev)}
        >
          <span>{selectedStatus === "all" ? "Status" : options.find(opt => opt.value === selectedStatus)?.description}</span>
          {getAnimatedArrow(isOpen)}
        </div>
        {isOpen && (
          <div className="dropdown-status__content">
            {options.map((option, index) => (
              <div
                key={option.value}
                className={`dropdown-status__item ${index === 0 ? "dropdown__item--grey" : ""}`}
                onClick={() => {
                  setSelectedStatus(option.value);
                  setIsOpen(false);
                }}
                style={{ display: "flex", alignItems: "center" }}
              >
                {option.value !== "all" && (
                  <div
                    style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      backgroundColor: option.circleColor,
                      marginRight: "8px",
                    }}
                  />
                )}
                {option.grayText && (
                  <span style={{ color: "grey", marginRight: "4px" }}>{option.grayText}</span>
                )}
                <span style={{ color: index === 0 ? "grey" : "black" }}>{option.description}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }
);

StatusFilter.displayName = "StatusFilter";

export default StatusFilter;