// File: src/components/home/modals/ai-chat-modal.component.tsx
// Last change: Refactored to use shared types and removed autoSubmit

import React, { useState } from "react";
import AIChat from "../content/chat/ai-chat.component";
import MapView from "../content/maps/map-view.component";
import { AIRequest, AIResponse, FormData } from "@/types/transport-forms.types";
// import "./ai-chat-modal.component.css";

interface AIChatModalProps {
  onClose: () => void;
  initialPrompt: AIRequest;
  type: "sender" | "hauler";
  onDataReceived?: (data: FormData) => void;
}

const AIChatModal: React.FC<AIChatModalProps> = ({
  onClose,
  initialPrompt,
  type,
  onDataReceived
}) => {
  const [activeTab, setActiveTab] = useState<"chat" | "map">("chat");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentResponse, setCurrentResponse] = useState<AIResponse | null>(null);

  const formatDateTime = (dateStr: string) => {
    if (!dateStr) {
      const today = new Date().toISOString().split('T')[0];
      return `${today}T12:00`;
    }
    return dateStr.includes('T') ? dateStr : `${dateStr}T12:00`;
  };

  const handleAIResponse = (response: AIResponse) => {
    try {
      setIsProcessing(true);
      setCurrentResponse(response);
      console.log("=== AI Response in Modal (Raw) ===", JSON.stringify(response, null, 2));

      if (!response?.data) {
        console.error("Invalid AI Response: Missing data object");
        return;
      }

      const formCompatibleData: FormData = {
        pickupLocation: response.data.pickupLocation?.trim() || "",
        deliveryLocation: response.data.deliveryLocation?.trim() || "",
        pickupTime: formatDateTime(response.data.pickupTime || ""),
        deliveryTime: formatDateTime(response.data.deliveryTime || ""),
        weight: parseInt(response.data.weight?.replace('kg', '') || "0"),
        palletCount: response.data.palletCount || 0
      };

      console.log("=== Transformed Data for Form ===", formCompatibleData);

      if (onDataReceived) {
        onDataReceived(formCompatibleData);
      }

    } catch (error) {
      console.error("Error processing AI response:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTabChange = (tab: "chat" | "map") => {
    setActiveTab(tab);
  };

  return (
    <div className="ai-chat-modal">
      <div className="ai-chat-modal-header">
        <h2 className="ai-chat-modal-title">
          {type === "sender" ? "AI Assistant for Clients" : "AI Assistant for Carriers"}
          {isProcessing && <span className="processing-indicator">Processing...</span>}
        </h2>
        <button 
          onClick={onClose} 
          className="ai-chat-modal-close"
          aria-label="Close modal"
        >
          Close
        </button>
      </div>

      <div className="ai-chat-modal-tabs" role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === "chat"}
          onClick={() => handleTabChange("chat")}
          className={`ai-chat-modal-tab ${activeTab === "chat" ? "active" : "inactive"}`}
        >
          Chat
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "map"}
          onClick={() => handleTabChange("map")}
          className={`ai-chat-modal-tab ${activeTab === "map" ? "active" : "inactive"}`}
        >
          Map
        </button>
      </div>

      <div 
        className="ai-chat-modal-content"
        role="tabpanel"
        aria-label={activeTab === "chat" ? "Chat content" : "Map content"}
      >
        {activeTab === "chat" && (
          <AIChat 
            initialPrompt={initialPrompt.message}
            type={type}
            onDataReceived={handleAIResponse}
          />
        )}
        {activeTab === "map" && (
          <MapView 
            locations={{
              pickup: currentResponse?.data?.pickupLocation || "",
              delivery: currentResponse?.data?.deliveryLocation || ""
            }}
          />
        )}
      </div>
    </div>
  );
};

export default AIChatModal;