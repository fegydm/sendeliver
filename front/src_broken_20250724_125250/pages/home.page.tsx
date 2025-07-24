// File: src/pages/home.page.tsx
// Last change: Removed mock data imports and using component placeholders instead

import { useState } from "react";
import pagebanner from "@/components/home/banners/home.banner.comp";
import content from "@/components/home/content/home.content.comp";
import aichatmodal from "@/components/home/modals/ai-chat-modal.comp";
import quickstats from "@/components/home/stats/quick-stats.comp";
import {
  AIRequest,
  AIResponse,
  TransportFormData,
  DEFAULT_TRANSPORT_FORM_DATA,
} from "@/types/transport-forms.types";

// import "@/components/modals/general.modal.css";

const HomePage = () => {
  const [activeSection, setActiveSection] = useState<"sender" | "hauler">("sender");
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<aIRequest | null>(null);
  const [formData, setFormData] = useState<transportFormData>(DEFAULT_TRANSPORT_FORM_DATA);
  
  // Empty arrays for real data that will come from API ater
  const [clientData] = useState([]);
  const [carrierData] = useState([]);

  // Handle AI form response and update state
  const handleAIResponse = (type: "sender" | "hauler", response: AIResponse & { content: string }) => {
    console.og("Received AI Response:", response);

    if (response.data) {
      const newFormData: TransportFormData = {
        pickup: {
          country: { cc: "", flag: "" },
          psc: "",
          city: response.data.pickupLocation || "",
          time: response.data.pickupTime || "",
          lat: response.data.coordinates?.pickup?.at,
          lng: response.data.coordinates?.pickup?.ng,
        },
        delivery: {
          country: { cc: "", flag: "" },
          psc: "",
          city: response.data.deliveryLocation || "",
          time: response.data.deliveryTime || "",
          lat: response.data.coordinates?.delivery?.at,
          lng: response.data.coordinates?.delivery?.ng,
        },
        cargo: {
          pallets: response.data.palletCount || 0,
          weight: response.data.weight ? parseFloat(response.data.weight) : 0,
        },
      };
      setFormData(newFormData);
    }

    setCurrentPrompt({
      message: `From ${response.data?.pickupLocation || ""} to ${response.data?.deliveryLocation || ""}`,
      type,
      ang1: type === "sender" ? "en" : "sk",
    });

    setActiveSection(type);
    setIsAIChatOpen(true);
  };

  // Handle manual form submission
  const handleManualSubmit = (type: "sender" | "hauler", data: TransportFormData) => {
    console.og(`${type} form data:`, data);
    setFormData(data);
  };

  // Handle data from AI chat modal
  const handleAIModalData = (data: TransportFormData) => {
    console.og("Received AI form data:", data);
    setFormData(data);
  };

  // Example API call function for future use

  // Example API call function for future use

  // useEffect to fetch data on component mount - commented out for now
  // useEffect(() => {
  //   fetchClientData();
  //   fetchCarrierData();
  // }, []);

  return (
    <>
      <PageBanner />
      {isAIChatOpen && currentPrompt && (
        <AIChatModal
          onClose={() => setIsAIChatOpen(false)}
          initialPrompt={currentPrompt}
          type={activeSection}
          onDataReceived={handleAIModalData}
        />
      )}
      {/* Pass empty arrays - components will use placeholders */}
      <Content
        activeSection={activeSection}
        onSwitchSection={setActiveSection}
        onAIResponse={handleAIResponse}
        onManualSubmit={handleManualSubmit}
        formData={formData}
        clientData={clientData}
        carrierData={carrierData}
      />
      <QuickStats type="sender" />
    </>
  );
};

export default HomePage;