// front/src/components/footers/ColorPaletteModalTrigger.tsx

import React, { useState } from "react";
import ColorPaletteModal from "@components/modals/color-palette-modal.component";

const ColorPaletteModalTrigger: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleModal = () => setIsOpen((prev) => !prev);

  return (
    <div>
      <button className="text-sm hover:underline" onClick={toggleModal}>
        Tailwind Color Palette
      </button>
      <ColorPaletteModal isOpen={isOpen} onClose={toggleModal} />
    </div>
  );
};

export default ColorPaletteModalTrigger;
