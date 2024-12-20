// ./front/src/components/modals/ai-chat-modal.component.tsx
import React, { useState } from "react";
import AIChat from "../sections/content/chat/ai-chat.component";
import MapView from "../sections/content/maps/map-view.component";
import "./ai-chat-modal.component.css";

interface AIChatModalProps {
  onClose: () => void;
  initialPrompt: string;
  type: "sender" | "carrier";
  onDataReceived?: (data: any) => void; 
}

const AIChatModal: React.FC<AIChatModalProps> = ({
  onClose,
  initialPrompt,
  type,
  onDataReceived
}) => {
  const [activeTab, setActiveTab] = useState<"chat" | "map">("chat");

  const handleAIResponse = (data: any) => {
    if (data?.data && onDataReceived) {
      onDataReceived(data.data);
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
  );
};

export default AIChatModal;