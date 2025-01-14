// File: src/pages/home.page.tsx
// Last change: Removed footer and moved to the main layout (app.tsx)

import { useState } from "react";
import PageBanner from "@/components/sections/banners/banner.component";
import Content from "@/components/sections/content/content.component";
import AISearchForm from "@/components/sections/content/search-forms/ai-search-form.component";
import ManualSearchForm from "@/components/sections/content/search-forms/manual-search-form.component";
import ResultTable from "@/components/sections/content/results/result-table.component";
import AIChatModal from "@/components/modals/ai-chat-modal.component";
import QuickStats from "@/components/sections/stats/quick-stats.component";
import FloatingButton from "@/components/elements/animation/floating-button.element";
import { mockClientData, mockCarrierData } from "@/data/mockData";
import { AIRequest, FormData } from "@/types/ai.types";
import "@/styles/main.css";

const HomePage = () => {
  const [activeSection, setActiveSection] = useState<"sender" | "carrier" | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<AIRequest | null>(null);
  const [formData, setFormData] = useState<FormData>({
    pickupLocation: "",
    deliveryLocation: "",
    pickupTime: "",
    deliveryTime: "",
    weight: 0,
    palletCount: 0
  });

  const handleAIRequest = (section: "sender" | "carrier", prompt: string) => {
    setActiveSection(section);
    setIsAIChatOpen(true);
    setCurrentPrompt({
      message: prompt,
      type: section,
      lang1: section === "sender" ? "en" : "sk"
    });
  };

  const handleManualSubmit = (type: string, data: FormData) => {
    console.log(`${type} form data:`, data);
    setFormData(data);
  };

  const handleAIData = (data: FormData) => {
    setFormData(data);
    console.log('Received AI data:', data);
  };

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
        senderContent={
          <>
            <AISearchForm 
              type="client" 
              onAIRequest={(prompt) => handleAIRequest("sender", prompt)} 
            />
            <ManualSearchForm 
              type="client" 
              onSubmit={(data) => handleManualSubmit("Sender", data)} 
              formData={formData}
            />
            <ResultTable type="client" data={mockClientData} />
          </>
        }
        carrierContent={
          <>
            <AISearchForm 
              type="carrier" 
              onAIRequest={(prompt) => handleAIRequest("carrier", prompt)} 
            />
            <ManualSearchForm 
              type="carrier" 
              onSubmit={(data) => handleManualSubmit("Carrier", data)} 
              formData={formData}
            />
            <ResultTable type="carrier" data={mockCarrierData} />
          </>
        }
      />

      <QuickStats type="sender" />
      
      <FloatingButton />
    </>
  );
};

export default HomePage;
