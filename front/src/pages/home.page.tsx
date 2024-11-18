// ./front/src/pages/home.page.tsx

import { useState } from "react";
import Navigation from "../components/navbars/navbar.component";
import PageBanner from "../components/banners/banner.component";
import Content from "../components/content/content.component";
import AISearchForm from "../components/search-forms/ai-search-form.component";
import ManualSearchForm from "../components/search-forms/manual-search-form.component";
import ResultTable from "../components/results/result-table.component";
import AIChatModal from "../components/modals/ai-chat-modal.component";
import PageFooter from "../components/footers/page-footer.component";
import FloatingButton from "../components/controllers/floating-button.component";
import { AIResponse } from "../services/ai.service";

interface TransportData {
  pickupLocation: string;
  deliveryLocation: string;
  pickupTime: string;
  deliveryTime: string;
  weight: number;
  palletCount: number;
}

interface HomePageProps {
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

const HomePage = ({ isDarkMode, onToggleDarkMode }: HomePageProps) => {
  const [activeSection, setActiveSection] = useState<
    "sender" | "carrier" | null
  >(null);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState("");
  const [transportData, setTransportData] = useState<TransportData>({
    pickupLocation: "",
    deliveryLocation: "",
    pickupTime: "",
    deliveryTime: "",
    weight: 0,
    palletCount: 0,
  });

  const handleAIOutput = (
    message: string,
    structuredData?: AIResponse["data"]
  ) => {
    if (structuredData) {
      setTransportData({
        pickupLocation: structuredData.pickupLocation || "",
        deliveryLocation: structuredData.deliveryLocation || "",
        pickupTime: structuredData.pickupTime || "",
        deliveryTime: structuredData.deliveryTime || "",
        weight: structuredData.weight || 0,
        palletCount: structuredData.palletCount || 0,
      });
    }
  };

  const handleAIRequest = (section: "sender" | "carrier", prompt: string) => {
    setActiveSection(section);
    setIsAIChatOpen(true);
    setCurrentPrompt(prompt);
  };

  return (
    <>
      {/* Navigation */}
      <Navigation isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />

      {/* Page Banner */}
      <PageBanner />

      {/* AI Chat Modal */}
      {isAIChatOpen && (
        <AIChatModal
          onClose={() => setIsAIChatOpen(false)}
          onMessage={handleAIOutput}
          initialPrompt={currentPrompt}
          type={activeSection || "sender"}
        />
      )}

      {/* Main Content */}
      <Content
        senderContent={
          <>
            <AISearchForm
              type="client"
              onAIRequest={(prompt) => handleAIRequest("sender", prompt)}
            />
            <ManualSearchForm
              type="client"
              onSubmit={(data) =>
                setTransportData({ ...transportData, ...data })
              }
            />
            <ResultTable type="client" data={[]} />
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
              onSubmit={(data) =>
                setTransportData({ ...transportData, ...data })
              }
            />
            <ResultTable type="carrier" data={[]} />
          </>
        }
      />

      {/* Page Footer */}
      <PageFooter />

      {/* Floating Button */}
      <FloatingButton />
    </>
  );
};

export default HomePage;
