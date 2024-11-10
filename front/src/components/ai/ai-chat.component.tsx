// ./front/src/components/ai/ai-chat.component.tsx
import { useState, useEffect, useRef } from "react";

interface AIChatProps {
  onClose: () => void;
}

interface Message {
  role: "user" | "ai";
  content: string;
}

const AIChat = ({ onClose }: AIChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content:
        "Vitajte! Som váš AI asistent pre prepravu. Ako vám môžem pomôcť?",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    setMessages((prev) => [...prev, { role: "user", content: inputText }]);
    setInputText("");
    setIsProcessing(true);

    // Simulovaná odpoveď
    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Simulovaná odpoveď AI." },
      ]);
      setIsProcessing(false);
    }, 1000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold">AI Asistent pre prepravu</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <span className="text-2xl">&times;</span>
        </button>
      </div>

      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.role === "user"
                ? "ml-auto bg-blue-500 text-white"
                : "bg-gray-100 dark:bg-gray-700"
            }`}
          >
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {isProcessing && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          AI spracováva vašu požiadavku...
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-auto">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Napíšte správu..."
            className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Odoslať
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;
