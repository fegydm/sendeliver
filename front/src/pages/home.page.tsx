// File: src/pages/home.page.tsx
// Last change: Removed duplicate FooterTest rendering

import { useState } from "react";
import Navigation from "@/components/sections/navbars/navbar.component";
import PageBanner from "@/components/sections/banners/banner.component";
import Content from "@/components/sections/content/content.component";
import AISearchForm from "@/components/sections/content/search-forms/ai-search-form.component";
import ManualSearchForm from "@/components/sections/content/search-forms/manual-search-form.component";
import ResultTable from "@/components/sections/content/results/result-table.component";
import AIChatModal from "@/components/modals/ai-chat-modal.component";
import QuickStats from "@/components/sections/stats/quick-stats.component";
import FooterPage from "@/components/sections/footers/footer-page.component";
import FloatingButton from "@/components/elements/animation/floating-button.element";
import { mockClientData, mockCarrierData } from "@/data/mockData";
import { AIRequest, FormData } from "@/types/ai.types";
import "@/styles/main.css";

interface HomePageProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const HomePage = ({ isDarkMode, onToggleDarkMode }: HomePageProps) => {
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
      <Navigation isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />
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

      <FooterPage onPinVerified={() => {}} />
      
      <FloatingButton />
    </>
  );
};

export default HomePage;