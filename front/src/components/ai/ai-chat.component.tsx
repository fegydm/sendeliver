// ./front/src/components/ai/ai-chat.component.tsx
import { useState, useEffect, useRef } from 'react';

interface AIChatProps {
  onClose: () => void;
  onDataExtracted: (data: any) => void;
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const AIChat: React.FC<AIChatProps> = ({ onClose, onDataExtracted }) => {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      content: 'Vitajte! Som váš AI asistent pre prepravu. Ako vám môžem pomôcť?' 
    }
  ]);
  const [isProcessing, setIsProcessing] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll na koniec správ
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Simulácia spracovania AI odpovede
  const processAIResponse = async (userInput: string) => {
    // Tu by išla reálna implementácia AI
    const mockData = {
      pickup: 'Dortmund',
      delivery: 'Paríž',
      weight: '280',
      pallets: 3
    };

    // Simulácia odpovede AI
    const aiResponse = `Rozumiem vašej požiadavke. Analyzoval som váš text a našiel som tieto informácie:
    - Miesto nakládky: ${mockData.pickup}
    - Miesto vykládky: ${mockData.delivery}
    - Hmotnosť: ${mockData.weight} kg
    - Počet paliet: ${mockData.pallets}
    
    Chcete tieto údaje použiť vo formulári?`;

    setMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
    onDataExtracted(mockData);
  };

  const handleUserInput = async (text: string) => {
    if (!text.trim() || isProcessing) return;

    // Pridanie user správy
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setIsProcessing(true);

    try {
      await processAIResponse(text);
    } catch (error) {
      setMessages(prev => [...prev, { 
        role: 'ai', 
        content: 'Prepáčte, vyskytla sa chyba pri spracovaní vašej požiadavky.' 
      }]);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b dark:border-gray-700">
        <h2 className="text-xl font-bold">AI Asistent pre prepravu</h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <span className="text-2xl">&times;</span>
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg max-w-[80%] ${
              msg.role === 'user'
                ? 'ml-auto bg-blue-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700'
            }`}
          >
            <div className="whitespace-pre-wrap">{msg.content}</div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Processing indicator */}
      {isProcessing && (
        <div className="text-sm text-gray-500 dark:text-gray-400 mb-2">
          AI spracováva vašu požiadavku...
        </div>
      )}
    </div>
  );
};

export default AIChat;