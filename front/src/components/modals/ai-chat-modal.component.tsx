// ./front/src/components/modals/ai-chat-modal.component.tsx
import React, { useState } from "react";
import AIChat from "../sections/content/chat/ai-chat.component";
import MapView from "../sections/content/maps/map-view.component";
import ManualSearchForm from "../sections/content/search-forms/manual-search-form.component";
import "./ai-chat-modal.component.css";

interface AIChatModalProps {
  onClose: () => void;
  initialPrompt: string;
  type: "sender" | "carrier";
}

const AIChatModal: React.FC<AIChatModalProps> = ({
  onClose,
  initialPrompt,
  type,
}) => {
  const [activeTab, setActiveTab] = useState<"chat" | "map">("chat");
  const [formData, setFormData] = useState({
    pickupLocation: "",
    deliveryLocation: "",
    pickupTime: "",
    deliveryTime: "",
    weight: 0,
    palletCount: 0,
  });

  const handleAIResponse = (data: any) => {
    if (data?.data) {
      setFormData({
        pickupLocation: data.data.pickupLocation || "",
        deliveryLocation: data.data.deliveryLocation || "",
        pickupTime: data.data.pickupTime || "",
        deliveryTime: data.data.deliveryTime || "",
        weight: data.data.weight || 0,
        palletCount: data.data.palletCount || 0,
      });
    }
  };

  return (
    <div className={`ai-chat-modal ${activeTab === "chat" ? "large" : ""}`}>
      <div className="ai-chat-modal-header">
        <h2 className="ai-chat-modal-title">
          {type === "sender"
            ? "AI Assistant for Clients"
            : "AI Assistant for Carriers"}
        </h2>
        <button onClick={onClose} className="ai-chat-modal-close">
          Close
        </button>
      </div>

      <div className="ai-chat-modal-container">
        <div className="ai-chat-modal-left">
          {/* Tabs */}
          <div className="ai-chat-modal-tabs">
            <button
              onClick={() => setActiveTab("chat")}
              className={`ai-chat-modal-tab ${
                activeTab === "chat" ? "active" : "inactive"
              }`}
            >
              Chat
            </button>
            <button
              onClick={() => setActiveTab("map")}
              className={`ai-chat-modal-tab ${
                activeTab === "map" ? "active" : "inactive"
              }`}
            >
              Map
            </button>
          </div>

          {/* Content */}
          <div className="ai-chat-modal-content">
            {activeTab === "chat" && (
              <AIChat 
                initialPrompt={initialPrompt} 
                type={type} 
                onDataReceived={handleAIResponse}
              />
            )}
            {activeTab === "map" && <MapView />}
          </div>
        </div>

        <div className="ai-chat-modal-right">
          <ManualSearchForm
            type={type === "sender" ? "client" : "carrier"}
            onSubmit={(data) => console.log("Form data updated:", data)}
            initialData={formData}
          />
        </div>
      </div>
    </div>
  );
};

export default AIChatModal;