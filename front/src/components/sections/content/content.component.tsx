// File: src/components/sections/content/content.component.tsx
// Last change: Added senderContent and haulerContent back to ContentProps

import React from "react";
import { Link } from "react-router-dom";

interface ContentProps {
  senderContent: React.ReactNode; // Sender-specific content
  haulerContent: React.ReactNode; // Hauler-specific content
}

const Content: React.FC<ContentProps> = ({ senderContent, haulerContent }) => {
  return (
    <div className="content">
      {/* Navigation */}
      <div className="content__navigation">
        <Link to="/sender">
          <button className="button button--left">Client Dashboard</button>
        </Link>
        <Link to="/hauler">
          <button className="button button--right">Carrier Dashboard</button>
        </Link>
      </div>

      {/* Sender Section */}
      <div className="content__wrapper">
        <section className="content__sender">
          <h2 className="content__title">Client Area</h2>
          {senderContent}
        </section>

        {/* Hauler Section */}
        <section className="content__hauler">
          <h2 className="content__title">Carrier Area</h2>
          {haulerContent}
        </section>
      </div>
    </div>
  );
};

export default Content;
