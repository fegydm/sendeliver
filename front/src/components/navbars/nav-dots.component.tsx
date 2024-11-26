import { FC, useState } from "react";
import DotsModal from "../modals/dots-modal.component";
import type { NavDotsProps, TopRowType, BottomRowType } from "../../types/dots";

const NavDots: FC<NavDotsProps> = ({ topDots, bottomDots, onClick }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleSelectionChange = (top: TopRowType, bottom: BottomRowType) => {
    // Tu môže byť logika pre zmenu stavu
    onClick(); // Voláme pôvodný onClick handler z props
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="absolute right-[60px] top-1/2 -translate-y-1/2"
        aria-label="Open dots menu"
      >
        <div className="flex flex-col gap-1">
          <div className="flex gap-1">
            {topDots.map((color, index) => (
              <div
                key={`top-${index}`}
                className="w-1.5 h-1.5 rounded-full transition-colors duration-modal"
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
          <div className="flex gap-1">
            {bottomDots.map((color, index) => (
              <div
                key={`bottom-${index}`}
                className="w-1.5 h-1.5 rounded-full transition-colors duration-modal"
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
