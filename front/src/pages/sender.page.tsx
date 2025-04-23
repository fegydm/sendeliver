// File: ./front/src/pages/sender.page.tsx
// Last change: Removed redundant Navigation and dark mode handling, handled globally in App.tsx

import React from "react";
import BannerS from "@/components/sender/content/sender.content.component";
import UnderConstruction from "@/components/shared/elements/under-construction.element";

const SenderPage: React.FC = () => {
  return (
    <div className="sender-page">
      <BannerS />
      <UnderConstruction />
    </div>
  );
};

export default SenderPage;
