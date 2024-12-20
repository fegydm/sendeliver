// ./front/src/components/sections/content/search-forms/ai-search-form.component.tsx
import React, { useState, useCallback } from "react";
import { Mic, MicOff } from 'lucide-react';
import AIChatModal from '../../../modals/ai-chat-modal.component';
import { useVoiceRecognition } from '../../../../hooks/use-voice-recognition';

type UserType = "sender" | "carrier";

interface AIRequestData {
  message: string;
  type: UserType;
  lang1?: string;
}

interface AiSearchProps {
  type: "client" | "carrier";
}

const AiSearch: React.FC<AiSearchProps> = ({ type: _type }) => {
  const [inputText, setInputText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPrompt, setCurrentPrompt] = useState<AIRequestData | null>(null);
  
  const convertType = (type: "client" | "carrier"): UserType => {
    return type === "client" ? "sender" : "carrier";
  };

  const openAIModal = useCallback((text: string) => {
    if (!text.trim() || isModalOpen) return;
    
    const requestData: AIRequestData = {
      message: text,
      type: convertType(_type),
      lang1: _type === "client" ? "en" : "sk"
    };

    setCurrentPrompt(requestData);
    setIsModalOpen(true);
  }, [_type, isModalOpen]);

  const { isListening, toggleListening } = useVoiceRecognition({
    language: _type === "client" ? "en-US" : "sk-SK",
    onTextChange: setInputText,
    onRecognitionEnd: openAIModal
  });

  return (
    <div className={`ai-search-form ${_type === "carrier" ? "carrier" : ""}`}>
      <div className={`ai-search-title ${_type === "carrier" ? "carrier" : ""}`}>
        {_type === "client"
          ? "Need to send something and find the perfect carrier? Ask AI or fill out the form."
          : "Need to find a suitable load for your truck? Ask AI or fill out the relevant form."}
      </div>

      <div className="ai-search-input">
        <textarea
          placeholder="Write your request here or use voice input..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <div className="ai-search-controls">
          <button
            onClick={toggleListening}
            className={`voice-input-button ${isListening ? 'active' : ''} ${
              _type === "carrier" ? "carrier" : ""
            }`}
            title={isListening ? 'Stop recording' : 'Start recording'}
            aria-label={isListening ? 'Stop recording' : 'Start recording'}
          >
            {isListening ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button
            onClick={() => openAIModal(inputText)}
            className={`ai-search-button ${_type === "carrier" ? "carrier" : ""}`}
          >
            Ask AI
          </button>
        </div>
      </div>

      {isModalOpen && currentPrompt && (
        <AIChatModal
          initialPrompt={currentPrompt}
          type={convertType(_type)}
          onClose={() => {
            setIsModalOpen(false);
            setCurrentPrompt(null);
          }}
          onDataReceived={(data) => {
            console.log('Received data from modal:', data);
          }}
        />
      )}
    </div>
  );
};

export default AiSearch;