// File: src/pages/home.page.tsx
// Last change: Fixed AIResponse type and handling

import { useState } from "react";
import PageBanner from "@/components/sections/banners/banner.component";
import Content from "@/components/sections/content/content.component";
import AIForm from "@/components/sections/content/search-forms/ai-form.component";
import ManualSearchForm from "@/components/sections/content/search-forms/manual-form.component";
import ResultTable from "@/components/sections/content/results/result-table.component";
import AIChatModal from "@/components/modals/ai-chat-modal.component";
import QuickStats from "@/components/sections/stats/quick-stats.component";
import { mockClientData, mockCarrierData } from "@/data/mockData";
import { AIRequest, FormData } from "@/types/ai.types";

// Define local interfaces to match AIForm
interface Coordinates {
  lat: number;
  lng: number;
}

interface AIResponse {
  pickupLocation: string;
  deliveryLocation: string;
  pickupTime: string;
  deliveryTime: string;
  weight: string;
  palletCount: number;
  coordinates?: {
    pickup?: Coordinates;
    delivery?: Coordinates;
  };
}

const HomePage = () => {
  const [activeSection, setActiveSection] = useState<"sender" | "hauler" | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<AIRequest | null>(null);
  const [formData, setFormData] = useState<FormData>({
    pickupLocation: "",
    deliveryLocation: "",
    pickupTime: "",
    deliveryTime: "",
    weight: 0,
    palletCount: 0,
  });

  const handleAIResponse = (type: "sender" | "hauler", aiResponse: AIResponse) => {
    console.log('Received AI Response:', aiResponse);
    
    // Update form data
    setFormData({
      pickupLocation: aiResponse.pickupLocation,
      deliveryLocation: aiResponse.deliveryLocation,
      pickupTime: aiResponse.pickupTime,
      deliveryTime: aiResponse.deliveryTime,
      weight: parseFloat(aiResponse.weight) || 0,
      palletCount: aiResponse.palletCount,
    });

    // Set current prompt for chat modal
    setCurrentPrompt({
      message: `From ${aiResponse.pickupLocation} to ${aiResponse.deliveryLocation}`,
      type,
      lang1: type === "sender" ? "en" : "sk",
    });

    setActiveSection(type);
    setIsAIChatOpen(true);
  };

  const handleManualSubmit = (type: "sender" | "hauler", data: FormData) => {
    console.log(`${type} form data:`, data);
    setFormData(data);
  };

  const handleAIData = (data: FormData) => {
    setFormData(data);
    console.log("Received AI data:", data);
  };

  const renderContent = (type: "sender" | "hauler") => (
    <>
      <AIForm
        type={type}
        onAIRequest={(response) => handleAIResponse(type, response)}
      />
      <ManualSearchForm
        type={type}
        onSubmit={(data) => handleManualSubmit(type, data)}
        formData={formData}
      />
      <ResultTable type={type} data={type === "sender" ? mockClientData : mockCarrierData} />
    </>
  );

  return (
    <>
      <PageBanner />

      {isAIChatOpen && currentPrompt && (
        <AIChatModal
          onClose={() => setIsAIChatOpen(false)}
          initialPrompt={currentPrompt}
          type={activeSection || "sender"}
          onDataReceived={handleAIData}
        />
      )}

      <Content
        senderContent={renderContent("sender")}
        haulerContent={renderContent("hauler")}
      />

      <QuickStats type="sender" />
    </>
  );
};

export default HomePage;