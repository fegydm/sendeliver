// ./front/src/components/content/content.component.tsx

import React from "react";
import SenderSection from "./sender-section.component";
import CarrierSection from "./carrier-section.component";

interface ContentProps {
  senderContent: React.ReactNode;
  carrierContent: React.ReactNode;
}

const Content: React.FC<ContentProps> = ({ senderContent, carrierContent }) => {
  return (
    <div className="flex flex-row w-full">
      {/* Sender Section (ľavá polovica) */}
      <div className="w-1/2 border-r border-gray-300 p-4">
        <SenderSection>{senderContent}</SenderSection>
      </div>

      {/* Carrier Section (pravá polovica) */}
      <div className="w-1/2 p-4">
        <CarrierSection>{carrierContent}</CarrierSection>
      </div>
    </div>
  );
};

export default Content;
