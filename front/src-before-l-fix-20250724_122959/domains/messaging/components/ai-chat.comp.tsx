// File: src/domains/messaging/components/ai-chat.comp.tsx
// Last change: Fixed duplicate message sending by using useCallback and proper initialization

import React, { useState, useRef, useEffect, useCallback } from "react";
import { AIService } from "@/services/ai.services";
import { AIRequest } from "@/types/transport-forms.types";
// import "./ai-chat.comp.css";

interface AIChatProps {
  initialPrompt: string;
  type: "sender" | "hauler";
  onDataReceived?: (data: any) => void;
}

interface Message {
  role: "user" | "ai" | "system";
  content: string;
}

const AIChat: React.FC<aIChatProps> = ({ 
  initialPrompt, 
  type, 
  onDataReceived
}) => {
  const [messages, setMessages] = useState<message[]>([
    {
      role: "ai",
      content: type === "sender"
        ? "Describe your shipment and transportation requirements."
        : "Describe your vehicle and availability.",
    }
  ]);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<hTMLInputElement>(null);
  const hasInitialPromptBeenProcessed = useRef(false);

  const handleAIResponse = useCallback(async (text: string) => {
    if (isLoading || !text.trim()) return;
    
    setIsLoading(true);
    setError(null);

    // Create request object
    const request: AIRequest = {
      message: text,
      type,
      lang1: type === "sender" ? "en" : "sk"
    };

    // Add user message to chat
    setMessages(prev => [...prev, { role: "user", content: text }]);

    try {
      const response = await AIService.sendMessage(request);
      
      // Add AI response to chat
      setMessages(prev => [...prev, {
        role: "ai",
        content: response.content
      }]);

      // Notify parent about received data
      if (onDataReceived) {
        onDataReceived(response);
      }

      if (process.env.NODE_ENV === 'development') {
        console.log('Structured AI Response:', response.data);
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      setError(errorMessage);
      console.error('Chat Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [type, onDataReceived, isLoading]);

  // Process initial prompt
  useEffect(() => {
    if (initialPrompt && !hasInitialPromptBeenProcessed.current) {
      handleAIResponse(initialPrompt);
      hasInitialPromptBeenProcessed.current = true;
    }
  }, [initialPrompt, handleAIResponse]);

  const handleSendMessage = (text: string) => {
    if (!text.trim() || isLoading) return;
    handleAIResponse(text);
    
    // Clear input
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<hTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      const input = inputRef.current;
      if (input && input.value.trim()) {
        handleSendMessage(input.value);
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
          if (input && input.value.trim()) {
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
          onKeyPress={handleKeyPress}
        />
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default AIChat;