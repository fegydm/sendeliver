// File: front/src/components/sections/content/content.component.tsx

import React from "react";
import { Link } from "react-router-dom";

// Props for Content component
interface ContentProps {
  senderContent: React.ReactNode; // Logic for the sender (left side)
  haulerContent: React.ReactNode; // Logic for the hauler (right side)
}

const Content: React.FC<ContentProps> = ({ senderContent, haulerContent }) => {
  return (
    <div className="content">
      {/* Wrapper for Sender (Client) and Hauler (Carrier) sections */}
      <div className="content__wrapper">
        {/* Sender Section (Client Area) */}
        <section className="content__sender">
          <div className="content__navigation">
            <Link to="/sender">
              <button className="button button--left">Client Dashboard</button>
            </Link>
          </div>
          <h2 className="content__title">Client Area</h2>
          {senderContent}
        </section>

        {/* Hauler Section (Carrier Area) */}
        <section className="content__hauler">
          <div className="content__navigation">
            <Link to="/hauler">
              <button className="button button--right">Carrier Dashboard</button>
            </Link>
          </div>
          <h2 className="content__title">Carrier Area</h2>
          {haulerContent}
        </section>
      </div>
    </div>
  );
};

export default Content;
