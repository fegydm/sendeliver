// ./front/src/components/content/content.component.tsx
import React from "react";

interface ContentProps {
  senderContent: React.ReactNode;
  carrierContent: React.ReactNode;
}

const Content: React.FC<ContentProps> = ({ senderContent, carrierContent }) => {
  return (
    <main className="bg-content-light dark:bg-content-dark py-8">
      <div className="max-w-content mx-auto px-container grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Ľavá sekcia - Sender Content */}
        <section className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-purple-700 mb-4 text-center">
            Klientska sekcia
          </h2>
          {senderContent}
        </section>

        {/* Pravá sekcia - Carrier Content */}
        <section className="bg-white dark:bg-gray-700 p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-bold text-green-700 mb-4 text-center">
            Dopravcovská sekcia
          </h2>
          {carrierContent}
        </section>
      </div>
    </main>
  );
};

export default Content;
