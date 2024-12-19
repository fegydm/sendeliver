// ./front/src/pages/home-page.component.tsx
import { useState, useEffect } from "react";
import Navigation from "@/components/sections/navbars/navbar.component";
import PageBanner from "@/components/sections/banners/banner.component";
import Content from "@/components/sections/content/content.component";
import AISearchForm from "@/components/sections/content/search-forms/ai-search-form.component";
import ManualSearchForm from "@/components/sections/content/search-forms/manual-search-form.component";
import ResultTable from "@/components/sections/content/results/result-table.component";
import AIChatModal from "@/components/modals/ai-chat-modal.component";
import QuickStats from "@/components/sections/stats/quick-stats.component"; // Updated import
import PageFooter from "@/components/sections/footers/footer-page.component";
import TestFooter from "@/components/sections/footers/footer-test.component";
import FloatingButton from "@/components/elements/floating-button.element";
import { mockClientData, mockCarrierData } from "@/data/mockData";

interface HomePageProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const HomePage = ({ isDarkMode, onToggleDarkMode }: HomePageProps) => {
  const [activeSection, setActiveSection] = useState<"sender" | "carrier" | null>(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [isTestFooterVisible, setIsTestFooterVisible] = useState(false);

  const isDevelopment = process.env.NODE_ENV === "development";

  useEffect(() => {
    if (isDevelopment) {
      setIsTestFooterVisible(true);
    }
  }, []);

  const handleAIRequest = (section: "sender" | "carrier", prompt: string) => {
    setActiveSection(section);
    setIsAIChatOpen(true);
    setCurrentPrompt(prompt);
  };

  const handleManualSubmit = (type: string, data: any) => {
    console.log(`${type} form data:`, data);
  };

  return (
    <>
      {/* Navigation */}
      <Navigation isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />

      {/* Banner */}
      <PageBanner />

      {/* AI Chat Modal */}
      {isAIChatOpen && (
        <AIChatModal
          onClose={() => setIsAIChatOpen(false)}
          initialPrompt={currentPrompt}
          type={activeSection || "sender"}
        />
      )}

      {/* Main Content */}
      <Content
        senderContent={
          <>
            <AISearchForm type="client" onAIRequest={(prompt) => handleAIRequest("sender", prompt)} />
            <ManualSearchForm type="client" onSubmit={(data) => handleManualSubmit("Sender", data)} />
            <ResultTable type="client" data={mockClientData} />
          </>
        }
        carrierContent={
          <>
            <AISearchForm type="carrier" onAIRequest={(prompt) => handleAIRequest("carrier", prompt)} />
            <ManualSearchForm type="carrier" onSubmit={(data) => handleManualSubmit("Carrier", data)} />
            <ResultTable type="carrier" data={mockCarrierData} />
          </>
        }
      />

      {/* Quick Stats */}
      <QuickStats type="sender" />

      {/* Footer */}
      <PageFooter onPinVerified={() => setIsTestFooterVisible(true)} />

      {/* Test Footer */}
      {isTestFooterVisible && <TestFooter />}

      {/* Floating Button */}
      <FloatingButton />
    </>
  );
};

export default HomePage;
