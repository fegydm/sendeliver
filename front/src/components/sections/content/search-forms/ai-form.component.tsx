// File: src/components/sections/content/search-forms/ai-form.component.tsx
// Last change: Fixed translation handling and improved error states

import { useState, useRef } from "react";
import { AIResponse } from "@/types/transport-forms.types";
import { useTranslationContext } from "@/contexts/TranslationContext";

interface Coordinates {
  lat: number;
  lng: number;
}

interface ExtractedAIResponse extends AIResponse {
  content: string;
  data: {
    pickupLocation: string;
    deliveryLocation: string;
    pickupTime: string;
    deliveryTime: string;
    weight: string;
    palletCount: number;
    coordinates?: {
      pickup?: Coordinates;
      delivery?: Coordinates;
    };
  };
}

interface AIFormProps {
  type: "sender" | "hauler";
  onAIRequest: (response: ExtractedAIResponse) => void;
  className?: string;
}

const AIForm: React.FC<AIFormProps> = ({ type, onAIRequest, className = '' }) => {
  const { t, isLoading, error } = useTranslationContext();

  console.log('[AIForm] isLoading:', isLoading, 'error:', error, 'type:', type);

  // Show loading state but don't block rendering
  const [activeTab, setActiveTab] = useState(0);
  const [prompts, setPrompts] = useState(["", "", ""]);
  const [showModal, setShowModal] = useState(false);
  const [currentResult, setCurrentResult] = useState<ExtractedAIResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLFormElement>(null);

  const getTypeKey = (senderKey: string, haulerKey: string): string => {
    return type === "sender" ? senderKey : haulerKey;
  };

  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
    
    // Clear any previous API errors when the user types
    if (apiError) setApiError(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentPrompt = prompts[activeTab];
    
    if (!currentPrompt.trim()) return;
    
    try {
      setIsSubmitting(true);
      setApiError(null);
      
      const response = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: currentPrompt,
          type,
          lang1: "en",
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const rawData = await response.json();
      
      const data: ExtractedAIResponse = {
        content: rawData.content || "",
        data: {
          pickupLocation: rawData.pickupLocation || "",
          deliveryLocation: rawData.deliveryLocation || "",
          pickupTime: rawData.pickupTime || "",
          deliveryTime: rawData.deliveryTime || "",
          weight: rawData.weight || "0",
          palletCount: rawData.palletCount || 0,
          coordinates: rawData.coordinates,
        },
      };

      console.log('[AIForm] AI Response:', data);
      setCurrentResult(data);
      setShowModal(true);
      onAIRequest(data);
    } catch (error) {
      console.error('[AIForm] Error fetching data:', error);
      setApiError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  const getPlaceholder = () => {
    const placeholders = [
      getTypeKey("ai_placeholder_example_1_sender", "ai_placeholder_example_1_hauler"),
      getTypeKey("ai_placeholder_example_2_sender", "ai_placeholder_example_2_hauler"),
      getTypeKey("ai_placeholder_example_3_sender", "ai_placeholder_example_3_hauler")
    ];
    return t(placeholders[activeTab]);
  };

  return (
    <div className={`ai-form ai-form--${type} ${className}`}>
      <h3 className="ai-form__title">
        {t(getTypeKey("ai_form_title_sender", "ai_form_title_hauler"))}
      </h3>
      <p className="ai-form__description">
        {t(getTypeKey("ai_form_description_sender", "ai_form_description_hauler"))}
      </p>
      
      <div className="ai-form__tabs">
        <button 
          className={`ai-form__tab ${activeTab === 0 ? 'ai-form__tab--active' : ''}`}
          onClick={() => setActiveTab(0)}
        >
          {t("ai_tab_example_1")}
        </button>
        <button 
          className={`ai-form__tab ${activeTab === 1 ? 'ai-form__tab--active' : ''}`}
          onClick={() => setActiveTab(1)}
        >
          {t("ai_tab_example_2")}
        </button>
        <button 
          className={`ai-form__tab ${activeTab === 2 ? 'ai-form__tab--active' : ''}`}
          onClick={() => setActiveTab(2)}
        >
          {t("ai_tab_example_3")}
        </button>
      </div>
      
      <form 
        ref={containerRef}
        onSubmit={handleSearch}
        className="ai-form__tab-content"
      >
        <textarea
          className="ai-form__textarea"
          placeholder={getPlaceholder()}
          value={prompts[activeTab]}
          onChange={(e) => handlePromptChange(activeTab, e.target.value)}
          rows={4}
          disabled={isSubmitting}
        />
        
        {apiError && (
          <div className="ai-form__error">{apiError}</div>
        )}
        
        <button 
          type="submit" 
          className="button ai-form__button"
          disabled={isSubmitting || !prompts[activeTab].trim()}
        >
          {isSubmitting 
            ? t("ai_button_processing") || "Processing..." 
            : t(getTypeKey("ai_button_ask_sender", "ai_button_ask_hauler"))}
        </button>
      </form>
      
      {showModal && currentResult && (
        <div className="ai-form__modal-overlay" onClick={handleModalClose}>
          <div className="ai-form__modal" onClick={(e) => e.stopPropagation()}>
            <div className="ai-form__modal-header">
              <h3>{t("ai_modal_title")}</h3>
              <button className="ai-form__modal-close" onClick={handleModalClose}>
                {t("ai_modal_close")}
              </button>
            </div>
            
            <div className="ai-form__result">
              <h3 className="ai-form__result-title">{t("ai_extracted_data")}</h3>
              
              <div className="ai-form__result-item">
                <strong className="ai-form__result-label">{t("ai_pickup_location")}:</strong>
                <span className="ai-form__result-value">{currentResult.data.pickupLocation}</span>
              </div>
              
              {currentResult.data.coordinates?.pickup && (
                <div className="ai-form__result-item">
                  <strong className="ai-form__result-label">{t("ai_gps")}:</strong>
                  <span className="ai-form__result-value">
                    {currentResult.data.coordinates.pickup.lat}, {currentResult.data.coordinates.pickup.lng}
                  </span>
                </div>
              )}
              
              <div className="ai-form__result-item">
                <strong className="ai-form__result-label">{t("ai_delivery_location")}:</strong>
                <span className="ai-form__result-value">{currentResult.data.deliveryLocation}</span>
              </div>
              
              {currentResult.data.coordinates?.delivery && (
                <div className="ai-form__result-item">
                  <strong className="ai-form__result-label">{t("ai_gps")}:</strong>
                  <span className="ai-form__result-value">
                    {currentResult.data.coordinates.delivery.lat}, {currentResult.data.coordinates.delivery.lng}
                  </span>
                </div>
              )}
              
              <div className="ai-form__result-item">
                <strong className="ai-form__result-label">{t("ai_pickup_date")}:</strong>
                <span className="ai-form__result-value">{currentResult.data.pickupTime}</span>
              </div>
              
              <div className="ai-form__result-item">
                <strong className="ai-form__result-label">{t("ai_delivery_date")}:</strong>
                <span className="ai-form__result-value">{currentResult.data.deliveryTime}</span>
              </div>
              
              <div className="ai-form__result-item">
                <strong className="ai-form__result-label">{t("ai_weight")}:</strong>
                <span className="ai-form__result-value">{currentResult.data.weight}</span>
              </div>
              
              <div className="ai-form__result-item">
                <strong className="ai-form__result-label">{t("ai_pallets")}:</strong>
                <span className="ai-form__result-value">{currentResult.data.palletCount}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIForm;