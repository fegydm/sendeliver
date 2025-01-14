// File: ./front/src/pages/hauler.page.tsx
// Last change: Removed redundant Navigation and dark mode handling, handled globally in App.tsx

import React from "react";
import BannerH from "@/components/sections/banners/banner-h.component";
import UnderConstruction from "@/components/elements/under-construction.element";

const HaulerPage: React.FC = () => {
  return (
    <div className="hauler-page">
      <BannerH />
      <UnderConstruction />
    </div>
  );
};

export default HaulerPage;
