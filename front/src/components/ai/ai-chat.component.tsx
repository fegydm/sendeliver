// ./front/src/components/ai/ai-chat.component.tsx
import { useState, useEffect, useRef } from "react";

interface AIChatProps {
  onClose: () => void;
  onMessage: (message: string) => void;
  initialPrompt?: string;
  type: 'sender' | 'carrier';
}

interface Message {
  role: "user" | "ai";
  content: string;
}

const AIChat: React.FC<AIChatProps> = ({ onClose, onMessage, initialPrompt, type }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: type === 'sender'
        ? "Vitajte! Som váš AI asistent pre prepravu. Popíšte mi prosím vašu zásielku (napr. miesto nakládky a vykládky, termíny, hmotnosť, počet paliet, typ tovaru, špeciálne požiadavky...)."
        : "Vitajte! Som váš AI asistent pre prepravu. Popíšte mi prosím vaše vozidlo a dostupnosť (napr. typ vozidla, nosnosť, lokalita, termíny...)."
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

  useEffect(() => {
    if (initialPrompt && !inputText) {
      setInputText(initialPrompt);
      const fakeEvent = { preventDefault: () => {} } as React.FormEvent<HTMLFormElement>;
      handleSubmit(fakeEvent);
    }
  }, [initialPrompt]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!inputText.trim() || isProcessing) return;

    const userMessage = inputText;
    setMessages((prev) => [...prev, { role: "user", content: userMessage }]);
    setInputText("");
    setIsProcessing(true);

    try {
      const response = await fetch(import.meta.env.VITE_AI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'sk'
        },
        body: JSON.stringify({
          message: userMessage,
          type: type,
          language: 'sk'
        })
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: data.content 
      }]);
      
      onMessage(data.content);

    } catch (error) {
      console.error('AI Chat Error:', error);
      setMessages(prev => [...prev, { 
        role: "ai", 
        content: "Prepáčte, vyskytla sa chyba pri spracovaní vašej požiadavky. Skúste to prosím znova." 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold">AI Asistent pre prepravu</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          aria-label="Zavrieť"
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
            placeholder={type === 'sender' 
              ? "Opíšte vašu zásielku..."
              : "Opíšte vaše vozidlo a dostupnosť..."}
            className="flex-1 p-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600"
            disabled={isProcessing}
          />
          <button
            type="submit"
            disabled={isProcessing || !inputText.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Odoslať
          </button>
        </div>
      </form>
    </div>
  );
};

export default AIChat;