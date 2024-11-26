// ./front/src/components/chat/ai-chat.component.tsx
import React, { useState } from "react";

interface AIChatProps {
  initialPrompt: string;
  type: "sender" | "carrier";
}

const AIChat: React.FC<AIChatProps> = ({ initialPrompt, type }) => {
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content:
        initialPrompt ||
        (type === "sender"
          ? "Popíšte vašu zásielku."
          : "Popíšte vaše vozidlo a dostupnosť."),
    },
  ]);

  const handleSendMessage = (text: string) => {
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    // Pridaj ďalšiu logiku pre komunikáciu s API
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} mb-2`}
          >
            <div
              className={`p-3 rounded-lg max-w-[70%] ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage("Demo správa");
        }}
        className="p-4 flex gap-2 border-t dark:border-gray-700"
      >
        <input
          type="text"
          className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600"
        />
        <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
          Odoslať
        </button>
      </form>
    </div>
  );
};

export default AIChat;
