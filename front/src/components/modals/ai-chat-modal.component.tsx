// ./front/src/components/modals/ai-chat-modal.component.tsx
import React, { useState } from "react";
import AIChat from "../chat/ai-chat.component";
import MapView from "../maps/map-view.component";

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

  return (
    <div className="fixed z-50 bg-white dark:bg-gray-800 shadow-lg w-full h-full lg:w-[40%] lg:h-full bottom-0 lg:right-0 lg:bottom-auto transition-transform duration-300">
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold">
          {type === "sender"
            ? "AI Asistent pre klientov"
            : "AI Asistent pre dopravcov"}
        </h2>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Zavrieť"
        >
          Zavrieť
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b dark:border-gray-700">
        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 p-4 text-center ${
            activeTab === "chat"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 dark:bg-gray-700"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab("map")}
          className={`flex-1 p-4 text-center ${
            activeTab === "map"
              ? "bg-blue-500 text-white"
              : "bg-gray-100 dark:bg-gray-700"
          }`}
        >
          Mapa
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === "chat" && (
          <AIChat initialPrompt={initialPrompt} type={type} />
        )}
        {activeTab === "map" && <MapView />}
      </div>
    </div>
  );
};

export default AIChatModal;
