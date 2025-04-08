// File: src/components/sections/content/content.component.tsx
// Last change: April 05, 2025 - Updated navigation keys and button position to use sender/hauler, with hover description shown only on button hover

import { useState } from "react";
import { Link } from "react-router-dom";
import AIForm from "@/components/sections/content/search-forms/ai-form.component";
import ManualForm from "@/components/sections/content/search-forms/manual-form.component";
import ResultTable, { SenderResultData } from "@/components/sections/content/results/result-table.component";
import Button from "@/components/ui/button.ui";
import { TransportFormData } from "@/types/transport-forms.types";
import { useTranslationContext } from "@/contexts/TranslationContext";

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
  const { t } = useTranslationContext(); // Get translation function

  const [isRequestConfirmed, setIsRequestConfirmed] = useState(false);
  const [senderVehicles, setSenderVehicles] = useState<SenderResultData[]>([]);
  const [haulerVehicles, setHaulerVehicles] = useState<SenderResultData[]>([]);
  const [senderTotalCount, setSenderTotalCount] = useState(0);
  const [haulerTotalCount, setHaulerTotalCount] = useState(0);
  const [senderLoadingDt, setSenderLoadingDt] = useState<string | undefined>(undefined);
  const [haulerLoadingDt, setHaulerLoadingDt] = useState<string | undefined>(undefined);

  // Handler to update vehicles found after manual form submission
  const handleVehiclesFound = (
    type: "sender" | "hauler",
    vehicles: SenderResultData[],
    totalCount: number,
    loadingDt: string
  ) => {
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

  // Handler for manual form submission
  const handleManualSubmit = (type: "sender" | "hauler", data: TransportFormData) => {
    console.log(`[Content] Form submitted for ${type}`, data);
    onManualSubmit(type, data);
  };

  // Define sections with sender and hauler data and translation keys for headers
  const sections = [
    {
      type: "sender" as const,
      navigationClass: "content__navigation--sender",
      wrapperClass: "content--sender",
      titleKey: "client_area_title",
      descriptionKey: "client_area_description",
      position: "sender" as const, // Updated to "sender"
      vehicles: senderVehicles,
      totalCount: senderTotalCount,
      loadingDt: senderLoadingDt,
      defaultData: clientData,
      navButtonKey: "client_area_link",
      navDescKey: "client_area_link_description",
    },
    {
      type: "hauler" as const,
      navigationClass: "content__navigation--hauler",
      wrapperClass: "content--hauler",
      titleKey: "carrier_area_title",
      descriptionKey: "carrier_area_description",
      position: "hauler" as const, // Updated to "hauler"
      vehicles: haulerVehicles,
      totalCount: haulerTotalCount,
      loadingDt: haulerLoadingDt,
      defaultData: carrierData,
      navButtonKey: "carrier_area_link",
      navDescKey: "carrier_area_link_description",
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
            {/* Wrap the button and description in a relative container */}
            <div className="navigation-button-wrapper">
              <Link to={`/${section.type}`} style={{ textDecoration: "none" }}>
                <Button
                  variant="primary"
                  role={section.position} // "sender" or "hauler"
                  active={activeSection === section.type}
                  onClick={() => onSwitchSection(section.type)} // Handle section switch
                >
                  {t(section.navButtonKey)}
                </Button>
              </Link>
              {/* Tooltip/subtext displayed only on button hover */}
              <p className="content__navigation-description">
                {t(section.navDescKey)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="content__wrapper">
        {sections.map((section) => (
          <section
            key={section.type}
            className={`${section.wrapperClass} ${activeSection === section.type ? "active" : ""}`}
          >
            {/* Use translated title and description inside the wrapper */}
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
