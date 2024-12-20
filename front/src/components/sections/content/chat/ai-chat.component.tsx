// ./front/src/components/sections/content/chat/ai-chat.component.tsx
import React, { useState, useRef } from "react";
import { AIService } from "@/services/ai.services";
import "./ai-chat.component.css";

interface AIChatProps {
  initialPrompt: string;
  type: "sender" | "carrier";
  onDataReceived?: (data: any) => void;
}

interface Message {
  role: "user" | "ai" | "system";
  content: string;
}

const AIChat: React.FC<AIChatProps> = ({ initialPrompt, type, onDataReceived }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: initialPrompt || (type === "sender"
        ? "Describe your shipment and transportation requirements."
        : "Describe your vehicle and availability."),
    },
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    setIsLoading(true);
    setError(null);

    // Add user message to chat
    const newMessage: Message = { role: "user", content: text };
    setMessages(prev => [...prev, newMessage]);

    try {
      const response = await AIService.sendMessage({
        message: text,
        type,
        lang1: "en"
      });
      
      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: "ai",
        content: response.content
      }]);

      // Notify parent about received data
      if (onDataReceived) {
        onDataReceived(response);
      }

      // Log structured data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('Structured AI Response:', response.data);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Chat Error:', err);
    } finally {
      setIsLoading(false);
      
      // Clear input
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    }
  };

  return (
    <div className="ai-chat">
      <div className="ai-chat-messages">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`ai-chat-message ${msg.role === "user" ? "user" : "ai"}`}
          >
            <div className={`ai-chat-bubble ${msg.role}`}>{msg.content}</div>
          </div>
        ))}
        {isLoading && (
          <div className="ai-chat-message ai">
            <div className="ai-chat-bubble ai loading">Thinking...</div>
          </div>
        )}
        {error && (
          <div className="ai-chat-message error">
            <div className="ai-chat-bubble error">{error}</div>
          </div>
        )}
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const input = inputRef.current;
          if (input) {
            handleSendMessage(input.value);
          }
        }}
        className="ai-chat-form"
      >
        <input
          ref={inputRef}
          type="text"
          placeholder="Write a message..."
          disabled={isLoading}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default AIChat;