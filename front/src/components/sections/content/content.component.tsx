// File: front/src/components/sections/content/content.component.tsx
// Last change: Reorganized content structure into navigation, sender, and carrier groups.

import React from "react";
import { Link } from "react-router-dom";

interface ContentProps {
  senderContent: React.ReactNode;
  carrierContent: React.ReactNode;
}

const Content: React.FC<ContentProps> = ({ senderContent, carrierContent }) => {
  return (
    <div className="content">
      {/* Content Navigation Section */}
      <div className="content-navigation">
        <Link to="/sender">
          <button className="button button-left">Client Dashboard</button>
        </Link>
        <Link to="/hauler">
          <button className="button button-right">Carrier Dashboard</button>
        </Link>
      </div>

      {/* Content Wrapper for Sections */}
      <div className="content-wrapper">
        {/* Sender Section */}
        <section className="content-sender">
          <h2>Client Area</h2>
          {senderContent}
        </section>

        {/* Carrier Section */}
        <section className="content-carrier">
          <h2>Carrier Area</h2>
          {carrierContent}
        </section>
      </div>
    </div>
  );
};

export default Content;
