// File: front/src/components/shared/modals/dots-modal.component.tsx
// Last action: Refactored to use GeneralModal and BEM styles.

import React, { useState, useEffect, FC } from "react";
import GeneralModal from "@/components/shared/modals/general.modal";
import { Button } from "@/components/shared/ui/button.ui";
import { ComponentColors } from "@/constants/colors/components";
import type { TopRowType, BottomRowType, DotsArray } from "@/types/dots";
import "./DotsModal.css";

import colors from "@/constants/colors";
const DOTS_COLORS = colors.components.dots;

interface SelectionGroupProps {
  title: string;
  options: { id: string; label: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
}

const SelectionGroup: FC<SelectionGroupProps> = ({ title, options, selected, onSelect }) => (
  <div className="selection-group">
    <h3 className="selection-group__title">{title}</h3>
    <div className="selection-group__options">
      {options.map(({ id, label }) => (
        <button key={id} onClick={() => onSelect(id)} className="selection-group__option">
          <div
            className="selection-group__dot"
            style={{ 
              backgroundColor: selected === id ? DOTS_COLORS[id as keyof typeof DOTS_COLORS] : DOTS_COLORS.inactive 
            }}
          />
          <span className={`selection-group__label ${selected === id ? 'selection-group__label--active' : ''}`}>
            {label}
          </span>
        </button>
      ))}
    </div>
  </div>
);

interface DotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectionChange: (top: TopRowType, bottom: BottomRowType) => void;
  initialTopDots: DotsArray;
  initialBottomDots: DotsArray;
}

const DotsModal: React.FC<DotsModalProps> = ({ isOpen, onClose, onSelectionChange, initialTopDots, initialBottomDots }) => {
  const [selectedTop, setSelectedTop] = useState<TopRowType>(null);
  const [selectedBottom, setSelectedBottom] = useState<BottomRowType>(null);

  useEffect(() => {
    if (isOpen) {
      const extractSelection = (dots: DotsArray, keys: string[]): string | null => {
        const activeIndex = dots.findIndex(color => color !== DOTS_COLORS.inactive);
        return activeIndex !== -1 ? keys[activeIndex] : null;
      };
      setSelectedTop(extractSelection(initialTopDots, ["client", "forwarder", "carrier"]) as TopRowType);
      setSelectedBottom(extractSelection(initialBottomDots, ["anonymous", "cookies", "registered"]) as BottomRowType);
    }
  }, [isOpen, initialTopDots, initialBottomDots]);

  const handleSelection = (type: string) => {
    if (["client", "forwarder", "carrier"].includes(type)) {
      setSelectedTop(type as TopRowType);
    } else {
      setSelectedBottom(type as BottomRowType);
    }
  };

  const handleApply = () => {
    onSelectionChange(selectedTop, selectedBottom);
    onClose();
  };

  return (
    <GeneralModal
      isOpen={isOpen}
      onClose={onClose}
      title="User Type Selection"
    >
      <div className="dots-modal">
        <SelectionGroup
          title="Select Role:"
          options={[
            { id: "client", label: "Client" },
            { id: "forwarder", label: "Forwarder" },
            { id: "carrier", label: "Carrier" },
          ]}
          selected={selectedTop}
          onSelect={handleSelection}
        />
        <SelectionGroup
          title="Select Status:"
          options={[
            { id: "anonymous", label: "Anonymous" },
            { id: "cookies", label: "With Cookies" },
            { id: "registered", label: "Registered" },
          ]}
          selected={selectedBottom}
          onSelect={handleSelection}
        />
      </div>
      <div className="dots-modal__actions">
          <Button variant="cancel" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleApply}>Apply</Button>
      </div>
    </GeneralModal>
  );
};

export default DotsModal;