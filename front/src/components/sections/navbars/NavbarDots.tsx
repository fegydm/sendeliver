// ./front/src/components/navbars/NavbarDots.tsx
import { FC, useState } from "react";
import DotsModal from "../../modals/dots-modal.component";
import type {
  NavDotsProps,
  TopRowType,
  BottomRowType,
} from "../../../types/dots";

const NavDots: FC<NavDotsProps> = ({ topDots, bottomDots, onClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectionChange = (_: TopRowType, __: BottomRowType) => {
    // Handle dots selection changes
    onClick();
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="nav-dots-button"
        aria-label="Open dots menu"
      >
        <div className="nav-dots-container">
          <div className="nav-dots-row">
            {topDots.map((color, index) => (
              <div
                key={`top-${index}`}
                className="nav-dot"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="nav-dots-row">
            {bottomDots.map((color, index) => (
              <div
                key={`bottom-${index}`}
                className="nav-dot"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </button>

      <DotsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectionChange={handleSelectionChange}
        initialTopDots={topDots}
        initialBottomDots={bottomDots}
      />
    </>
  );
};

export default NavDots;
