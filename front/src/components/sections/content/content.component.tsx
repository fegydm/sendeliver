// ./front/src/components/content/content.component.tsx
import React from "react";
import { Link } from "react-router-dom";
// import "./content.component.css"; // Import CSS file old version

interface ContentProps {
  senderContent: React.ReactNode;
  carrierContent: React.ReactNode;
}

const Content: React.FC<ContentProps> = ({ senderContent, carrierContent }) => {
  return (
    <main>
      {/* Buttons for navigation */}
      <div className="button-container">
        <Link to="/sender">
          <button className="button button-left">Client Dashboard</button>
        </Link>
        <Link to="/hauler">
          <button className="button button-right">Carrier Dashboard</button>
        </Link>
      </div>

      {/* Main content container */}
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
