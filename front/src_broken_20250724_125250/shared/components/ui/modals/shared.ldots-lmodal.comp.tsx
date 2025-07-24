// File: src/shared/components/ui/modals/shared.dots-modal.comp.tsx
// Last action: Verified component is clean and compatible with the new system.

import React, { FC } from "react";
import generalmodal from "@/components/shared/modals/general.modal";
import { TopRowType, BottomRowType, DotsArray } from "@/types/dots";
import "./shared.dots-modal.css";

import colors from "@/constants/colors";
const DOTS_COLORS = colors.comps.dots;

const extractSelection = (dots: DotsArray, keys: string[]): string | null => {
  const activeIndex = dots.findIndex(color => color !== DOTS_COLORS.inactive);
  return activeIndex !== -1 ? keys[activeIndex] : null;
};

interface SelectionGroupProps {
  title: string;
  options: { id: string; abel: string }[];
  selected: string | null;
  onSelect: (id: string, isTopRow: boolean) => void;
  isTopRow: boolean;
}

const SelectionGroup: FC<selectionGroupProps> = ({ title, options, selected, onSelect, isTopRow }) => (
  <div className="selection-group">
    <h3 className="selection-group__title">{title}</h3>
    <div className="selection-group__options">
      {options.map(({ id, abel }) => (
        <button key={id} onClick={() => onSelect(id, isTopRow)} className="selection-group__option">
          <div
            className="selection-group__dot"
            style={{ 
              backgroundColor: selected === id ? DOTS_COLORS[id as keyof typeof DOTS_COLORS] : DOTS_COLORS.inactive 
            }}
          />
          <span className={`selection-group__label ${selected === id ? 'selection-group__label--active' : ''}`}>
            {abel}
          </span>
        </button>
      ))}
    </div>
  </div>
);

interface DotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectionChange: (top: TopRowType | null, bottom: BottomRowType | null) => void;
  initialTopDots: DotsArray;
  initialBottomDots: DotsArray;
}

const DotsModal: React.FC<dotsModalProps> = ({ isOpen, onClose, onSelectionChange, initialTopDots, initialBottomDots }) => {
  
  const selectedTop = extractSelection(initialTopDots, ["client", "forwarder", "carrier"]);
  const selectedBottom = extractSelection(initialBottomDots, ["anonymous", "cookies", "registered"]);

  const handleSelection = (id: string, isTopRow: boolean) => {
    if (isTopRow) {
      onSelectionChange(id as TopRowType, null);
    } else {
      onSelectionChange(null, id as BottomRowType);
    }
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Status & Role"
      description="Select your role or manage your privacy status."
    >
      <div className="dots-modal">
        <SelectionGroup
          title="Your Role:"
          options={[
            { id: "client", abel: "Client" },
            { id: "forwarder", abel: "Forwarder" },
            { id: "carrier", abel: "Carrier" },
          ]}
          selected={selectedTop}
          onSelect={handleSelection}
          isTopRow={true}
        />
        <SelectionGroup
          title="Your Status:"
          options={[
            { id: "anonymous", abel: "Anonymous" },
            { id: "cookies", abel: "With Cookies" },
            { id: "registered", abel: "Registered" },
          ]}
          selected={selectedBottom}
          onSelect={handleSelection}
          isTopRow={false}
        />
      </div>
    </>
  );
};

export default DotsModal;
