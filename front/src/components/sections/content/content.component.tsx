// File: front/src/components/sections/content/content.component.tsx

import React from "react";
import { Link } from "react-router-dom";

interface ContentProps {
  senderContent: React.ReactNode;
  carrierContent: React.ReactNode;
}

const Content: React.FC<ContentProps> = ({ senderContent, carrierContent }) => {
  return (
    <div className="content">
      {/* Wrapper for Sender and Hauler sections */}
      <div className="content__wrapper">
        {/* Sender Section */}
        <section className="content__sender">
          <div className="content__navigation">
            <Link to="/sender">
              <button className="button button--left">Client Dashboard</button>
            </Link>
          </div>
          <h2>Client Area</h2>
          {senderContent}
        </section>

        {/* Hauler Section */}
        <section className="content__hauler">
          <div className="content__navigation">
            <Link to="/hauler">
              <button className="button button--right">Carrier Dashboard</button>
            </Link>
          </div>
          <h2>Carrier Area</h2>
          {carrierContent}
        </section>
      </div>
    </div>
  );
};

export default Content;
