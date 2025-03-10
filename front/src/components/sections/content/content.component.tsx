// File: src/components/sections/content/content.component.tsx
// Last change: Both sender and hauler sections are always rendered in the wrapper

import React from "react";
import { Link } from "react-router-dom";
import AIForm from "@/components/sections/content/search-forms/ai-form.component";
import ManualForm from "@/components/sections/content/search-forms/manual-form.component";
import ResultTable from "@/components/sections/content/results/result-table.component";

interface ContentProps {
  activeSection: "sender" | "hauler"; // Current active section for styling or logic
  onSwitchSection: (section: "sender" | "hauler") => void;
  onAIResponse: (type: "sender" | "hauler", response: any) => void;
  onManualSubmit: (type: "sender" | "hauler", data: any) => void;
  formData: any;
  clientData: any;
  carrierData: any;
}

const Content: React.FC<ContentProps> = ({
  activeSection,
  onSwitchSection,
  onAIResponse,
  onManualSubmit,
  formData,
  clientData,
  carrierData,
}) => {
  return (
    <div className="content">
      {/* Navigation */}
      <div className="content__navigation">
        <Link to="/sender">
          <button
            className={`button button--left ${activeSection === "sender" ? "active" : ""}`}
            onClick={() => onSwitchSection("sender")}
          >
            Client Dashboard
          </button>
        </Link>
        <Link to="/hauler">
          <button
            className={`button button--right ${activeSection === "hauler" ? "active" : ""}`}
            onClick={() => onSwitchSection("hauler")}
          >
            Carrier Dashboard
          </button>
        </Link>
      </div>

      {/* Wrapper set as flex container with two columns */}
      <div className="content__wrapper">
        <section className={`content__sender ${activeSection === "sender" ? "active" : ""}`}>
          <h2 className="content__title">Client Area</h2>
          {/* Directly assign class for AI form */}
          <AIForm
            type="sender"
            onAIRequest={(response: any) => onAIResponse("sender", response)}
            className="sender-content__ai-form"
          />
          {/* Directly assign class for Manual form */}
          <ManualForm
            type="sender"
            onSubmit={(data: any) => onManualSubmit("sender", data)}
            formData={formData}
            className="sender-content__manual-form"
          />
          {/* ResultTable wrapped in a div with class corresponding to sender */}
          <div className="sender-content__result-table">
            <ResultTable type="sender" data={clientData} />
          </div>
        </section>

        <section className={`content__hauler ${activeSection === "hauler" ? "active" : ""}`}>
          <h2 className="content__title">Carrier Area</h2>
          <AIForm
            type="hauler"
            onAIRequest={(response: any) => onAIResponse("hauler", response)}
            className="hauler-content__ai-form"
          />
          <ManualForm
            type="hauler"
            onSubmit={(data: any) => onManualSubmit("hauler", data)}
            formData={formData}
            className="hauler-content__manual-form"
          />
          <div className="hauler-content__result-table">
            <ResultTable type="hauler" data={carrierData} />
          </div>
        </section>
      </div>
    </div>
  );
};

export default Content;
