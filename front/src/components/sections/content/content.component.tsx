// File: .front/src/components/sections/content/content.component.tsx
import { useState } from "react";
import { Link } from "react-router-dom";
import AIForm from "@/components/sections/content/search-forms/ai-form.component";
import ManualForm from "@/components/sections/content/search-forms/manual-form.component";
import ResultTable, { SenderResultData } from "@/components/sections/content/results/result-table.component";
import Button from "@/components/ui/button.ui";
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
  const [isRequestConfirmed, setIsRequestConfirmed] = useState(false);
  const [senderVehicles, setSenderVehicles] = useState<SenderResultData[]>([]);
  const [haulerVehicles, setHaulerVehicles] = useState<SenderResultData[]>([]);
  const [senderTotalCount, setSenderTotalCount] = useState(0);
  const [haulerTotalCount, setHaulerTotalCount] = useState(0);
  const [senderLoadingDt, setSenderLoadingDt] = useState<string | undefined>(undefined);
  const [haulerLoadingDt, setHaulerLoadingDt] = useState<string | undefined>(undefined);

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

  const handleManualSubmit = (type: "sender" | "hauler", data: TransportFormData) => {
    console.log(`[Content] Form submitted for ${type}`, data);
    onManualSubmit(type, data);
  };

  return (
    <div className="content">
      <div className="content__navigation">
        <div className="content__navigation-left">
          <Link to="/sender">
            <Button
              variant="primary"
              position="left"
              active={activeSection === "sender"}
              onClick={() => onSwitchSection("sender")}
            >
              Client Dashboard
            </Button>
          </Link>
        </div>
        <div className="content__navigation-right">
          <Link to="/hauler">
            <Button
              variant="primary"
              position="right"
              active={activeSection === "hauler"}
              onClick={() => onSwitchSection("hauler")}
            >
              Carrier Dashboard
            </Button>
          </Link>
        </div>
      </div>

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