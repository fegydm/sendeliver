// ./front/src/components/content/content.component.tsx
import React from "react";

interface ContentProps {
  senderContent: React.ReactNode;
  carrierContent: React.ReactNode;
}

const Content: React.FC<ContentProps> = ({ senderContent, carrierContent }) => {
  return (
    <div className="w-full px-4 py-8">
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Ľavá strana - Sender Content */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-center">Klient</h2>
          {senderContent}
        </div>

        {/* Pravá strana - Carrier Content */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
          <h2 className="text-lg font-bold mb-4 text-center">Dopravca</h2>
          {carrierContent}
        </div>
      </div>
    </div>
  );
};

export default Content;
