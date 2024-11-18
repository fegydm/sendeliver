// ./front/src/components/modals/ai-chat-modal.component.tsx
import { useState, useEffect, useRef } from "react";
import { FaRobot, FaUser, FaTimes, FaPaperPlane } from "react-icons/fa";
import { AIRequest, AIResponse } from "@shared/types/ai.types";

interface AIChatProps {
  onClose: () => void;
  onMessage: (message: string, data?: AIResponse["data"]) => void;
  initialPrompt?: string;
  type: "sender" | "carrier";
}

interface Message {
  role: "user" | "ai";
  content: string;
  data?: AIResponse["data"];
}

const AIChat: React.FC<AIChatProps> = ({
  onClose,
  onMessage,
  initialPrompt,
  type,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        type === "sender"
          ? "Vitajte! Som váš AI asistent pre prepravu. Popíšte mi prosím vašu zásielku (napr. miesto nakládky a vykládky, termíny, hmotnosť, počet paliet, typ tovaru, špeciálne požiadavky...)."
          : "Vitajte! Som váš AI asistent pre prepravu. Popíšte mi prosím vaše vozidlo a dostupnosť (napr. typ vozidla, nosnosť, lokalita, termíny...).",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    scrollToBottom();
    inputRef.current?.focus();
  }, [messages]);

  useEffect(() => {
    if (initialPrompt) {
      setInputText(initialPrompt);
      handleSend(initialPrompt);
    }
  }, [initialPrompt]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInputText("");
    setIsProcessing(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/ai/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept-Language": "sk",
        },
        body: JSON.stringify({
          message: text,
          type: type,
          language: "sk",
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || `API Error: ${response.status}`);
      }

      const data: AIResponse = await response.json();

      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content: data.content,
          data: data.data,
        },
      ]);

      onMessage(data.content, data.data);
    } catch (error) {
      console.error("AI Chat Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          role: "ai",
          content:
            "Prepáčte, vyskytla sa chyba pri spracovaní vašej požiadavky. Skúste to prosím znova.",
        },
      ]);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleSend(inputText);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg">
      <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
        <div className="flex items-center gap-2">
          <FaRobot className="text-blue-500 text-xl" />
          <h2 className="text-xl font-bold">AI Asistent pre prepravu</h2>
        </div>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label="Zavrieť"
        >
          <FaTimes className="text-gray-500" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            {msg.role === "ai" && (
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <FaRobot className="text-blue-500" />
              </div>
            )}
            <div
              className={`p-3 rounded-lg max-w-[70%] ${
                msg.role === "user"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-100 dark:bg-gray-700"
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.content}</div>
              {msg.data && (
                <div className="mt-2 text-xs opacity-75">
                  Dáta boli automaticky spracované
                </div>
              )}
            </div>
            {msg.role === "user" && (
              <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
                <FaUser className="text-white" />
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t dark:border-gray-700">
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-2">
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-blue-500 border-t-transparent"></div>
            AI spracováva vašu požiadavku...
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={
              type === "sender"
                ? "Opíšte vašu zásielku..."
                : "Opíšte vaše vozidlo a dostupnosť..."
            }
            className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <FaPaperPlane />
            <span className="hidden sm:inline">Odoslať</span>
          </button>
        </form>
      </div>
    </div>
  );
};

export default AIChat;
