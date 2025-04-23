import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import colors from "@/constants/colors";

// Type definition
type TopRowType = "client" | "forwarder" | "carrier" | null;
type BottomRowType = "anonymous" | "cookies" | "registered" | null;
type DotsArray = string[];
type pm = {
  client: string;
  forwarder: string;
  carrier: string;
  anonymous: string;
  cookies: string;
  registered: string;
  inactive: string;
};

interface DotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectionChange: (top: TopRowType, bottom: BottomRowType) => void;
  initialTopDots: DotsArray;
  initialBottomDots: DotsArray;
}

const DOTS_COLORS = colors.components.dots;
const DEFAULT_COLOR = DOTS_COLORS.inactive;

// Helper functions
const extractTopSelection = (dots: DotsArray): TopRowType => {
  const keys: Array<"client" | "forwarder" | "carrier"> = [
    "client",
    "forwarder",
    "carrier",
  ];
  const activeIndex = dots.findIndex((color) => color !== DEFAULT_COLOR);
  return activeIndex !== -1 ? keys[activeIndex] : null;
};

const extractBottomSelection = (dots: DotsArray): BottomRowType => {
  const keys: Array<"anonymous" | "cookies" | "registered"> = [
    "anonymous",
    "cookies",
    "registered",
  ];
  const activeIndex = dots.findIndex((color) => color !== DEFAULT_COLOR);
  return activeIndex !== -1 ? keys[activeIndex] : null;
};

const DotsModal: React.FC<DotsModalProps> = ({
  isOpen,
  onClose,
  onSelectionChange,
  initialTopDots,
  initialBottomDots,
}) => {
  const [selectedTop, setSelectedTop] = useState<TopRowType>(null);
  const [selectedBottom, setSelectedBottom] = useState<BottomRowType>(null);

  useEffect(() => {
    if (isOpen) {
      const topResult = extractTopSelection(initialTopDots);
      const bottomResult = extractBottomSelection(initialBottomDots);

      setSelectedTop(topResult);
      setSelectedBottom(bottomResult);
    }
  }, [isOpen, initialTopDots, initialBottomDots]);

  const handleSelection = (type: string) => {
    let newTop = selectedTop;
    let newBottom = selectedBottom;

    if (type === "client" || type === "forwarder" || type === "carrier") {
      newTop = type as TopRowType;
      setSelectedTop(newTop);
    } else if (
      type === "anonymous" ||
      type === "cookies" ||
      type === "registered"
    ) {
      newBottom = type as BottomRowType;
      setSelectedBottom(newBottom);
    }
  };

  const handleApply = () => {
    if (selectedTop !== null && selectedBottom !== null) {
      onSelectionChange(selectedTop, selectedBottom);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-modal-backdrop backdrop-blur-modal z-modalBackdrop" />
      <div
        style={{ top: "var(--modal-top-offset)" }}
        className="fixed left-1/2 transform -translate-x-1/2 w-full max-w-modal mx-modal-sides z-modal"
      >
        <div className="bg-modal-light-bg dark:bg-modal-dark-bg rounded-modal shadow-modal max-h-[90vh] overflow-y-auto">
          <div className="relative p-6">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-1 hover:bg-modal-light-hover dark:hover:bg-modal-dark-hover rounded-lg transition-colors duration-modal"
              aria-label="Close modal"
            >
              <FaTimes size={20} />
            </button>

            <h2 className="text-modal-title font-bold mb-modal-gap">
              User Type Selection
            </h2>

            <div className="space-y-6">
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

            <div className="flex justify-end space-x-modal-gap mt-6">
              <button
                onClick={onClose}
                className="px-4 py-2 hover:bg-modal-light-hover dark:hover:bg-modal-dark-hover rounded-lg transition-colors duration-modal"
              >
                Cancel
              </button>
              <button
                onClick={handleApply}
                className="px-4 py-2 bg-navbar-light-button-bg hover:bg-navbar-light-button-hover 
                        text-navbar-light-button-text dark:bg-navbar-dark-button-bg 
                        dark:hover:bg-navbar-dark-button-hover dark:text-navbar-dark-button-text 
                        rounded-lg transition-colors duration-modal"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

interface SelectionGroupProps {
  title: string;
  options: { id: string; label: string }[];
  selected: string | null;
  onSelect: (id: string) => void;
}

const SelectionGroup: React.FC<SelectionGroupProps> = ({
  title,
  options,
  selected,
  onSelect,
}) => (
  <div>
    <h3 className="font-semibold mb-3">{title}</h3>
    <div className="flex justify-center gap-8">
      {options.map(({ id, label }) => (
        <button
          key={id}
          onClick={() => onSelect(id)}
          className="flex flex-col items-center gap-2 w-[120px]"
        >
          <div
            className="w-4 h-4 rounded-full transition-colors duration-modal"
            style={{
              backgroundColor:
                selected === id
                  ? DOTS_COLORS[id as keyof typeof DOTS_COLORS]
                  : DEFAULT_COLOR,
            }}
          />
          <span className="text-sm text-center">{label}</span>
        </button>
      ))}
    </div>
  </div>
);

export default DotsModal;
