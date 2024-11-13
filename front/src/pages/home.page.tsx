// ./front/src/pages/home.page.tsx

import { useState } from "react";
import Navigation from "../components/navigation.component";
import Banner from "../components/banners/banner.component";
import SearchForm from "../components/search-form.component";
import AiSearch from "../components/ai/ai-search.component";
import ContentSection from "../components/content-section.component";
import FloatingButton from "../components/floating-button.component";
import AIChat from "../components/ai/ai-chat.component";
import { AIResponse } from "../services/ai.service.ts";

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
  const [activeSection, setActiveSection] = useState<"sender" | "carrier" | null>(null);
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

  const parseMessageText = (message: string): TransportData => {
    const data: TransportData = {
      pickupLocation: "",
      deliveryLocation: "",
      pickupTime: "",
      deliveryTime: "",
      weight: 0,
      palletCount: 0,
    };

    const locationMatch = message.match(/nakladka:\s*([^\n]+).*vykladka:\s*([^\n]+)/is);
    if (locationMatch) {
      data.pickupLocation = locationMatch[1].trim();
      data.deliveryLocation = locationMatch[2].trim();
    }

    const timeMatch = message.match(/čas\s*nakladky:\s*([^\n]+).*čas\s*vykladky:\s*([^\n]+)/is);
    if (timeMatch) {
      data.pickupTime = timeMatch[1].trim();
      data.deliveryTime = timeMatch[2].trim();
    }

    const weightMatch = message.match(/hmotnosť:\s*(\d+)/i);
    if (weightMatch) {
      data.weight = parseInt(weightMatch[1]);
    }

    const palletMatch = message.match(/paliet:\s*(\d+)/i);
    if (palletMatch) {
      data.palletCount = parseInt(palletMatch[1]);
    }

    return data;
  };

  const handleAIOutput = (message: string, structuredData?: AIResponse["data"]) => {
    if (structuredData) {
      setTransportData({
        pickupLocation: structuredData.pickupLocation || "",
        deliveryLocation: structuredData.deliveryLocation || "",
        pickupTime: structuredData.pickupTime || "",
        deliveryTime: structuredData.deliveryTime || "",
        weight: structuredData.weight || 0,
        palletCount: structuredData.palletCount || 0,
      });
    } else {
      const data = parseMessageText(message);
      setTransportData(data);
    }
  };

  const handleAIRequest = (section: "sender" | "carrier", prompt: string) => {
    setActiveSection(section);
    setIsAIChatOpen(true);
    setCurrentPrompt(prompt);
  };

  return (
    <>
      <Navigation isDarkMode={isDarkMode} onToggleDarkMode={onToggleDarkMode} />

      <Banner />

      <div style={{ border: "1px solid #ccc", padding: "8px" }}>
        {/* AI Chat Modal */}
        {isAIChatOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden">
            <div className="absolute inset-0 bg-black/50">
              <div className="mx-auto max-w-container px-container py-8 h-full flex items-start">
                <div
                  style={{
                    width: "100%",
                    backgroundColor: "#fff",
                    borderRadius: "8px",
                    height: "calc(100vh - 160px)",
                  }}
                >
                  <AIChat
                    onClose={() => setIsAIChatOpen(false)}
                    onMessage={handleAIOutput}
                    initialPrompt={currentPrompt}
                    type={activeSection || "sender"}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        <main style={{ display: "flex", padding: "8px", marginTop: "8px" }}>
          {/* Left Column */}
          <div
            style={{
              width: "50%",
              padding: "8px",
              borderRight: "1px solid #ccc",
            }}
          >
            <h2>Sender Section</h2>
            <AiSearch
              type="client"
              onAIRequest={(prompt) => handleAIRequest("sender", prompt)}
            />
            <SearchForm
              type="client"
              data={transportData}
              onUpdate={(newData) => setTransportData((prev) => ({ ...prev, ...newData }))}
            />
          </div>

          {/* Right Column */}
          <div
            style={{
              width: "50%",
              padding: "8px",
              borderLeft: "1px solid #ccc",
            }}
          >
            <h2>Carrier Section</h2>
            <AiSearch
              type="carrier"
              onAIRequest={(prompt) => handleAIRequest("carrier", prompt)}
            />
            <SearchForm
              type="carrier"
              data={transportData}
              onUpdate={(newData) => setTransportData((prev) => ({ ...prev, ...newData }))}
            />
          </div>
        </main>

        <footer
          style={{
            width: "100%",
            backgroundColor: "#e2e8f0",
            textAlign: "center",
            padding: "8px",
            borderTop: "1px solid #ccc",
          }}
        >
          Footer Content
        </footer>
      </div>

      <FloatingButton />
    </>
  );
};

export default HomePage;
