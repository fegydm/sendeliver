// ./front/src/components/content/content.component.tsx
import React from "react";

interface ContentProps {
  senderContent: React.ReactNode;
  carrierContent: React.ReactNode;
}

const Content: React.FC<ContentProps> = ({ senderContent, carrierContent }) => {
  return (
    <div className="w-full px-4 py-8">
      <div className="max-w-content mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Ľavá strana - Sender Content */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-center text-purple-700">
            Klient
          </h2>
          {senderContent}
        </div>

        {/* Pravá strana - Carrier Content */}
        <div className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-bold mb-4 text-center text-green-700">
            Dopravca
          </h2>
          {carrierContent}
        </div>
      </div>
    </div>
  );
};

export default Content;
