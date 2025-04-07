// File: ./front/src/components/sections/content/content.component.tsx
// Last change: April 05, 2025 - Fixed navigation by removing unnecessary event blocking

import { useState } from "react";
import { Link } from "react-router-dom";
import { useTranslationContext } from "@/contexts/TranslationContext"; // Predpokladám tvoj TranslationProvider
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
  const { t } = useTranslationContext(); // Funkcia na preklad, fallback je kľúč
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

  const sections = [
    {
      type: "sender" as const,
      navigationClass: "content__navigation--sender",
      wrapperClass: "content--sender",
      titleKey: "client_area_title",
      descriptionKey: "client_area_description",
      dashboardKey: "client_area_link",
      dashboardDescriptionKey: "client_area_link_description",
      position: "left" as const,
      vehicles: senderVehicles,
      totalCount: senderTotalCount,
      loadingDt: senderLoadingDt,
      defaultData: clientData,
    },
    {
      type: "hauler" as const,
      navigationClass: "content__navigation--hauler",
      wrapperClass: "content--hauler",
      titleKey: "carrier_area_title",
      descriptionKey: "carrier_area_description",
      dashboardKey: "carrier_area_link",
      dashboardDescriptionKey: "carrier_area_link_description",
      position: "right" as const,
      vehicles: haulerVehicles,
      totalCount: haulerTotalCount,
      loadingDt: haulerLoadingDt,
      defaultData: carrierData,
    },
  ];

  return (
    <div className="content">
      <div className="content__navigation">
        {sections.map((section) => (
          <div
            key={section.type}
            className={`${section.navigationClass} ${activeSection === section.type ? "active" : ""}`}
          >
            <Link to={`/${section.type}`} style={{ textDecoration: "none" }}>
              <Button
                variant="primary"
                position={section.position}
                active={activeSection === section.type}
                onClick={() => onSwitchSection(section.type)}
              >
                {t(section.dashboardKey)}
              </Button>
              <span className="button__description">{t(section.dashboardDescriptionKey)}</span>
            </Link>
          </div>
        ))}
      </div>

      <div className="content__wrapper">
        {sections.map((section) => (
          <section
            key={section.type}
            className={`${section.wrapperClass} ${activeSection === section.type ? "active" : ""}`}
          >
            <h2 className="content__title">{t(section.titleKey)}</h2>
            <p className="content__description">{t(section.descriptionKey)}</p>
            <AIForm
              type={section.type}
              onAIRequest={(response: any) => {
                console.log(`[Content] AI response for ${section.type}:`, response);
                onAIResponse(section.type, response);
              }}
            />
            <ManualForm
              type={section.type}
              onSubmit={(data: TransportFormData) => handleManualSubmit(section.type, data)}
              onVehiclesFound={(vehicles, totalCount, loadingDt) =>
                handleVehiclesFound(section.type, vehicles, totalCount, loadingDt)
              }
              formData={formData}
            />
            <ResultTable
              type={section.type}
              data={section.vehicles.length > 0 ? section.vehicles : section.defaultData}
              totalCount={section.totalCount || 0}
              loadingDt={section.loadingDt}
              isConfirmed={isRequestConfirmed}
            />
          </section>
        ))}
      </div>
    </div>
  );
};

export default Content;