// ./front/src/components/content/content.component.tsx
import React from "react";

interface ContentProps {
  senderContent: React.ReactNode;
  carrierContent: React.ReactNode;
}

const Content: React.FC<ContentProps> = ({ senderContent, carrierContent }) => {
  return (
    <main>
      <div className="container">
        {/* Left section - Sender Content */}
        <section>
          <h2>Client area</h2>
          {senderContent}
        </section>

        {/* Right section - Hauler Content */}
        <section>
          <h2>Carrier area</h2>
          {carrierContent}
        </section>
      </div>
    </main>
  );
};

export default Content;
