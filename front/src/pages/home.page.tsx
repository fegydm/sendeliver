// ./front/src/pages/home.page.tsx
import { useState } from "react";
import Navigation from "@/components/sections/navbars/navbar.component";
import PageBanner from "@/components/sections/banners/banner.component";
import Content from "@/components/sections/content/content.component";
import AISearchForm from "@/components/sections/content/search-forms/ai-search-form.component";
import ManualSearchForm from "@/components/sections/content/search-forms/manual-search-form.component";
import ResultTable, {
  ClientResultData,
  CarrierResultData,
} from "@/components/sections/content/results/result-table.component";
import AIChatModal from "@/components/modals/ai-chat-modal.component";
import PageFooter from "@/components/sections/footers/page-footer.component";
import FloatingButton from "@/components/elements/floating-button.component";
import TestFooter from "@/components/sections/footers/test-footer.component";

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

  const handleAIRequest = (section: "sender" | "carrier", prompt: string) => {
    setActiveSection(section);
    setIsAIChatOpen(true);
    setCurrentPrompt(prompt);
  };

  const mockClientData: ClientResultData[] = [
    {
      distance: "50 km",
      vehicleType: "Truck",
      availabilityTime: "10:00",
      eta: "12:00",
    },
  ];

  const mockCarrierData: CarrierResultData[] = [
    {
      pickup: "Bratislava",
      delivery: "Košice",
      pallets: 10,
      weight: "3.5t",
    },
  ];

  return (
    <>
      {/* Navigation Bar */}
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
            <AISearchForm
              type="client"
              onAIRequest={(prompt) => handleAIRequest("sender", prompt)}
            />
            <ManualSearchForm
              type="client"
              onSubmit={(data: TransportData) => {
                console.log("Sender form data:", data);
              }}
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
              onSubmit={(data: TransportData) => {
                console.log("Carrier form data:", data);
              }}
            />
            <ResultTable type="carrier" data={mockCarrierData} />
          </>
        }
      />

      {/* Footer */}
      <PageFooter />

      {/* Development Footer */}
      <TestFooter onOpenAdminPanel={() => console.log("Admin Panel Opened")} />

      {/* Floating Button */}
      <FloatingButton />
    </>
  );
};

export default HomePage;
