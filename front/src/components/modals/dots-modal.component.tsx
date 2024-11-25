// ./front/src/components/modals/dots-modal.component.tsx
import React from "react";
import { FaTimes } from "react-icons/fa";
import colors from "@constants/colors";
import type { TopRowType, BottomRowType, DotsArray, DotsColors, DotsColorValues } from "@types";

interface DotsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectionChange: (top: TopRowType, bottom: BottomRowType) => void;
  initialTopDots: DotsArray;
  initialBottomDots: DotsArray;
}

type SelectionType =
  | "client"
  | "forwarder"
  | "carrier"
  | "anonymous"
  | "cookies"
  | "registered";

const DOTS_COLORS = colors.components.dots;
const DEFAULT_COLOR = DOTS_COLORS.inactive;

const COLOR_MAP: Record<Exclude<keyof DotsColors, "inactive">, SelectionType> = {
  client: "client",
  forwarder: "forwarder",
  carrier: "carrier",
  anonymous: "anonymous",
  cookies: "cookies",
  registered: "registered",
};

const DotsModal: React.FC<DotsModalProps> = ({
  isOpen,
  onClose,
  onSelectionChange,
  initialTopDots,
  initialBottomDots,
}) => {
  const getInitialSelection = () => {
    let initialTop: TopRowType = null;
    let initialBottom: BottomRowType = null;

    // Kontrola horného radu
    const activeTopIndex = initialTopDots.findIndex(
      (color: DotsColorValues) => color !== DEFAULT_COLOR
    );
    if (activeTopIndex !== -1) {
      const colorEntries = Object.entries(DOTS_COLORS);
      const colorKey = colorEntries.find(
        ([_, value]) => value === initialTopDots[activeTopIndex]
      )?.[0] as keyof typeof COLOR_MAP | undefined;

      if (colorKey && ["client", "forwarder", "carrier"].includes(COLOR_MAP[colorKey])) {
        initialTop = COLOR_MAP[colorKey] as TopRowType;
      }
    }

    // Kontrola spodného radu
    const activeBottomIndex = initialBottomDots.findIndex(
      (color: DotsColorValues) => color !== DEFAULT_COLOR
    );
    if (activeBottomIndex !== -1) {
      const colorEntries = Object.entries(DOTS_COLORS);
      const colorKey = colorEntries.find(
        ([_, value]) => value === initialBottomDots[activeBottomIndex]
      )?.[0] as keyof typeof COLOR_MAP | undefined;

      if (colorKey && ["anonymous", "cookies", "registered"].includes(COLOR_MAP[colorKey])) {
        initialBottom = COLOR_MAP[colorKey] as BottomRowType;
      }
    }

    return { initialTop, initialBottom };
  };

  const [selectedTop, setSelectedTop] = React.useState<TopRowType>(null);
  const [selectedBottom, setSelectedBottom] = React.useState<BottomRowType>(null);

  React.useEffect(() => {
    if (isOpen) {
      const { initialTop, initialBottom } = getInitialSelection();
      setSelectedTop(initialTop);
      setSelectedBottom(initialBottom);
    }
  }, [isOpen, initialTopDots, initialBottomDots]);

  const handleSelection = (type: SelectionType) => {
    if (["client", "forwarder", "carrier"].includes(type)) {
      const newTop = type as TopRowType;
      setSelectedTop(newTop);
      onSelectionChange(newTop, selectedBottom);
    } else {
      const newBottom = type as BottomRowType;
      setSelectedBottom(newBottom);
      onSelectionChange(selectedTop, newBottom);
    }
  };

  const handleApply = () => {
    onSelectionChange(selectedTop, selectedBottom);
    onClose();
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
              <div>
                <h3 className="font-semibold mb-3">Select Role:</h3>
                <div className="flex justify-center gap-8">
                  {[
                    { id: "client", label: "Client" },
                    { id: "forwarder", label: "Forwarder" },
                    { id: "carrier", label: "Carrier" },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => handleSelection(id as SelectionType)}
                      className="flex flex-col items-center gap-2 w-[120px]"
                    >
                      <div
                        className="w-4 h-4 rounded-full transition-colors duration-modal"
                        style={{
                          backgroundColor:
                            selectedTop === id
                              ? DOTS_COLORS[id as keyof typeof DOTS_COLORS]
                              : DEFAULT_COLOR,
                        }}
                      />
                      <span className="text-sm text-center">{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Select Status:</h3>
                <div className="flex justify-center gap-8">
                  {[
                    { id: "anonymous", label: "Anonymous" },
                    { id: "cookies", label: "With Cookies" },
                    { id: "registered", label: "Registered" },
                  ].map(({ id, label }) => (
                    <button
                      key={id}
                      onClick={() => handleSelection(id as SelectionType)}
                      className="flex flex-col items-center gap-2 w-[120px]"
                    >
                      <div
                        className="w-4 h-4 rounded-full transition-colors duration-modal"
                        style={{
                          backgroundColor:
                            selectedBottom === id
                              ? DOTS_COLORS[id as keyof typeof DOTS_COLORS]
                              : DEFAULT_COLOR,
                        }}
                      />
                      <span className="text-sm text-center">{label}</span>
                    </button>
                  ))}
                </div>
              </div>
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

export default DotsModal;