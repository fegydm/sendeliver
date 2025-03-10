// File: src/pages/home.page.tsx
// Last change: Refactored to integrate sub components inside Content component

import { useState } from "react";
import PageBanner from "@/components/sections/banners/banner.component";
import Content from "@/components/sections/content/content.component";
import AIChatModal from "@/components/modals/ai-chat-modal.component";
import QuickStats from "@/components/sections/stats/quick-stats.component";
import { mockClientData, mockCarrierData } from "@/data/mockData";
import {
  AIRequest,
  AIResponse,
  TransportFormData,
  DEFAULT_TRANSPORT_FORM_DATA,
} from "@/types/transport-forms.types";

const HomePage = () => {
  const [activeSection, setActiveSection] = useState<"sender" | "hauler">("sender");
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<AIRequest | null>(null);
  const [formData, setFormData] = useState<TransportFormData>(DEFAULT_TRANSPORT_FORM_DATA);

  // Handle AI form response and update state
  const handleAIResponse = (type: "sender" | "hauler", response: AIResponse & { content: string }) => {
    console.log("Received AI Response:", response);

    if (response.data) {
      const newFormData: TransportFormData = {
        pickup: {
          country: { cc: "", flag: "" },
          psc: "",
          city: response.data.pickupLocation || "",
          time: response.data.pickupTime || "",
          lat: response.data.coordinates?.pickup?.lat,
          lng: response.data.coordinates?.pickup?.lng,
        },
        delivery: {
          country: { cc: "", flag: "" },
          psc: "",
          city: response.data.deliveryLocation || "",
          time: response.data.deliveryTime || "",
          lat: response.data.coordinates?.delivery?.lat,
          lng: response.data.coordinates?.delivery?.lng,
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
      lang1: type === "sender" ? "en" : "sk",
    });

    setActiveSection(type);
    setIsAIChatOpen(true);
  };

  // Handle manual form submission
  const handleManualSubmit = (type: "sender" | "hauler", data: TransportFormData) => {
    console.log(`${type} form data:`, data);
    setFormData(data);
  };

  // Handle data from AI chat modal
  const handleAIModalData = (data: TransportFormData) => {
    console.log("Received AI form data:", data);
    setFormData(data);
  };

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
      {/* Pass all required props to Content component */}
      <Content
        activeSection={activeSection}
        onSwitchSection={setActiveSection}
        onAIResponse={handleAIResponse}
        onManualSubmit={handleManualSubmit}
        formData={formData}
        clientData={mockClientData}
        carrierData={mockCarrierData}
      />
      <QuickStats type="sender" />
    </>
  );
};

export default HomePage;
