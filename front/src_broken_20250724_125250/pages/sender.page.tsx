// File: ./front/src/pages/sender.page.tsx
// Last change: Removed redundant Navigation and dark mode handling, handled globally in App.tsx

import react from "react";
import banners from "@/components/sender/content/sender.content.comp";
import underconstruction from "@/components/shared/elements/under-construction.comp";

const SenderPage: React.FC = () => {
  return (
    <div className="sender-page">
      <BannerS />
      <UnderConstruction />
    </div>
  );
};

export default SenderPage;
