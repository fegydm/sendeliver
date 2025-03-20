// File: src/components/sections/content/content.component.tsx
// Last change: Added vehicle data handling from manual form to ResultTable

import { useState } from "react";
import { Link } from "react-router-dom";
import AIForm from "@/components/sections/content/search-forms/ai-form.component";
import ManualForm from "@/components/sections/content/search-forms/manual-form.component";
import ResultTable, { SenderResultData } from "@/components/sections/content/results/result-table.component";
import { TransportFormData } from "@/types/transport-forms.types";

interface ContentProps {
  activeSection: "sender" | "hauler"; 
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
  // State to track if search request has been confirmed/processed
  const [isRequestConfirmed, setIsRequestConfirmed] = useState(false);
  
  // State for holding vehicle data found by the form
  const [senderVehicles, setSenderVehicles] = useState<SenderResultData[]>([]);
  const [haulerVehicles, setHaulerVehicles] = useState<SenderResultData[]>([]);
  
  // State for total vehicle counts
  const [senderTotalCount, setSenderTotalCount] = useState(0);
  const [haulerTotalCount, setHaulerTotalCount] = useState(0);
  
  // State for loading datetime
  const [senderLoadingDt, setSenderLoadingDt] = useState<string | undefined>(undefined);
  const [haulerLoadingDt, setHaulerLoadingDt] = useState<string | undefined>(undefined);
  
  // Handle vehicle data received from ManualForm
  const handleVehiclesFound = (type: "sender" | "hauler", vehicles: SenderResultData[], totalCount: number, loadingDt: string) => {
    console.log(`[Content] Received ${vehicles.length} vehicles for ${type}`, vehicles);
    setIsRequestConfirmed(true);
    
    if (type === "sender") {
      setSenderVehicles(vehicles);
      setSenderTotalCount(totalCount);
      setSenderLoadingDt(loadingDt);
    } else {
      setHaulerVehicles(vehicles);
      setHaulerTotalCount(totalCount);
      setHaulerLoadingDt(loadingDt);
    }
  };

  // Handle form submission
  const handleManualSubmit = (type: "sender" | "hauler", data: TransportFormData) => {
    console.log(`[Content] Form submitted for ${type}`, data);
    onManualSubmit(type, data);
  };

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
          
          <AIForm
            type="sender"
            onAIRequest={(response: any) => onAIResponse("sender", response)}
            className="sender-content__ai-form"
          />
          
          <ManualForm
            type="sender"
            onSubmit={(data: TransportFormData) => handleManualSubmit("sender", data)}
            onVehiclesFound={(vehicles, totalCount, loadingDt) => 
              handleVehiclesFound("sender", vehicles, totalCount, loadingDt)
            }
            formData={formData}
            className="sender-content__manual-form"
          />
          
          <ResultTable 
            type="sender" 
            // Use searched vehicles if available, otherwise fall back to clientData
            data={senderVehicles.length > 0 ? senderVehicles : clientData} 
            totalCount={senderTotalCount || 0}
            loadingDt={senderLoadingDt}
            className="result-table result-table--sender sender-content__result-table" 
            isConfirmed={isRequestConfirmed}
          />
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
            onSubmit={(data: TransportFormData) => handleManualSubmit("hauler", data)}
            onVehiclesFound={(vehicles, totalCount, loadingDt) => 
              handleVehiclesFound("hauler", vehicles, totalCount, loadingDt)
            }
            formData={formData}
            className="hauler-content__manual-form"
          />
          
          <ResultTable 
            type="hauler" 
            // Use searched vehicles if available, otherwise fall back to carrierData
            data={haulerVehicles.length > 0 ? haulerVehicles : carrierData} 
            totalCount={haulerTotalCount || 0}
            loadingDt={haulerLoadingDt}
            className="result-table result-table--hauler hauler-content__result-table" 
            isConfirmed={isRequestConfirmed}
          />
        </section>
      </div>
    </div>
  );
};

export default Content;