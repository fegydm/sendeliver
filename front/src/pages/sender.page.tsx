// File: ./front/src/pages/sender.page.tsx
// Last change: Removed redundant Navigation and dark mode handling, handled globally in App.tsx

import React from "react";
import BannerS from "@/components/sections/banners/banner-s.component";
import UnderConstruction from "@/components/elements/under-construction.element";

const SenderPage: React.FC = () => {
  return (
    <div className="sender-page">
      <BannerS />
      <UnderConstruction />
    </div>
  );
};

export default SenderPage;
