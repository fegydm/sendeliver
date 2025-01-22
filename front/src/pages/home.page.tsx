// File: src/pages/home.page.tsx
// Last change: Adjusted for BEM structure and unified sender/hauler logic

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
import "@/styles/main.css";

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

  // Handle AI search requests
  const handleAIRequest = (section: "sender" | "hauler", prompt: string) => {
    setActiveSection(section);
    setIsAIChatOpen(true);
    setCurrentPrompt({
      message: prompt,
      type: section,
      lang1: section === "sender" ? "en" : "sk",
    });
  };

  // Handle manual form submissions
  const handleManualSubmit = (type: string, data: FormData) => {
    console.log(`${type} form data:`, data);
    setFormData(data);
  };

  // Handle AI responses
  const handleAIData = (data: FormData) => {
    setFormData(data);
    console.log("Received AI data:", data);
  };

  // Render content for sender or hauler
  const renderContent = (type: "sender" | "hauler") => (
    <>
      <AIForm
        type={type}
        onAIRequest={(prompt) => handleAIRequest(type, prompt)}
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
