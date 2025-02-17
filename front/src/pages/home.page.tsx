// File: src/pages/home.page.tsx
// Last change: Fixed type compatibility issues

import { useState } from "react";
import PageBanner from "@/components/sections/banners/banner.component";
import Content from "@/components/sections/content/content.component";
import AIForm from "@/components/sections/content/search-forms/ai-form.component";
import ManualSearchForm from "@/components/sections/content/search-forms/manual-form.component";
import ResultTable from "@/components/sections/content/results/result-table.component";
import AIChatModal from "@/components/modals/ai-chat-modal.component";
import QuickStats from "@/components/sections/stats/quick-stats.component";
import { mockClientData, mockCarrierData } from "@/data/mockData";
import { 
  AIRequest, 
  AIResponse,
  FormData,
  AIFormData,
  convertToFormData,
  convertAIResponseToFormData
} from "@/types/form-ai.types";

const DEFAULT_FORM_DATA: FormData = {
  pickup: {
    country: { code: '', flag: '' },
    psc: '',
    city: '',
    time: ''
  },
  delivery: {
    country: { code: '', flag: '' },
    psc: '',
    city: '',
    time: ''
  },
  cargo: {
    pallets: 0,
    weight: 0
  }
};

const HomePage = () => {
  const [activeSection, setActiveSection] = useState<"sender" | "hauler" | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<AIRequest | null>(null);
  const [formData, setFormData] = useState<FormData>(DEFAULT_FORM_DATA);

  const handleAIResponse = (type: "sender" | "hauler", response: AIResponse & { content: string }) => {
    console.log('Received AI Response:', response);
    
    if (response.data) {
      const aiFormData = convertAIResponseToFormData(response);
      const newFormData = convertToFormData(aiFormData);
      setFormData(newFormData);
    }

    setCurrentPrompt({
      message: `From ${response.data?.pickupLocation || ''} to ${response.data?.deliveryLocation || ''}`,
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

  const handleAIModalData = (aiFormData: FormData) => {
    // Convert FormData from modal to our internal format if needed
    const modalData = aiFormData as unknown as AIFormData;
    const newFormData = convertToFormData(modalData);
    console.log("Received AI form data:", modalData);
    setFormData(newFormData);
  };

  const renderContent = (type: "sender" | "hauler") => (
    <>
      <AIForm
        type={type}
        onAIRequest={(response) => handleAIResponse(type, response)}
      />
      <ManualSearchForm
        userType={type}
        onSubmit={(data) => handleManualSubmit(type, data)}
        formData={formData}
      />
      <ResultTable 
        type={type} 
        data={type === "sender" ? mockClientData : mockCarrierData} 
      />
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
          onDataReceived={handleAIModalData}
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