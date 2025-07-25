// File: src/components/sections/content/search-forms/ai-form.component.tsx
// Last change: Updated Tabs UI usage and Button disabled state for empty textarea.

import React, { useState, useRef } from "react";
import { AIResponse } from "@/types/transport-forms.types";
import { useTranslationContext } from "@/contexts/TranslationContext";
import { Tabs } from "@/components/shared/ui/tabs.ui"; // Import Tabs component
import Button from "@/components/shared/ui/button.ui";  // Import Button component
import "./ai-form.component.css";

// Define prompt options with corresponding translation keys for placeholder
const PROMPT_OPTIONS = [
  {
    key: "ai_tab_example_1",
    promptKey: { sender: "ai_placeholder_example_1_sender", hauler: "ai_placeholder_example_1_hauler" },
  },
  {
    key: "ai_tab_example_2",
    promptKey: { sender: "ai_placeholder_example_2_sender", hauler: "ai_placeholder_example_2_hauler" },
  },
  {
    key: "ai_tab_example_3",
    promptKey: { sender: "ai_placeholder_example_3_sender", hauler: "ai_placeholder_example_3_hauler" },
  },
];

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

const AIForm: React.FC<AIFormProps> = ({ type, onAIRequest, className = "" }) => {
  const { t } = useTranslationContext();

  // Store active tab as a string matching one of the PROMPT_OPTIONS keys
  const [activeTab, setActiveTab] = useState<string>("ai_tab_example_1");
  // Array holding prompt text for each option
  const [prompts, setPrompts] = useState(["", "", ""]);
  const [showModal, setShowModal] = useState(false);
  const [currentResult, setCurrentResult] = useState<ExtractedAIResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const containerRef = useRef<HTMLFormElement>(null);

  // Utility: choose translation key based on type
  const getTypeKey = (senderKey: string, haulerKey: string): string => {
    return type === "sender" ? senderKey : haulerKey;
  };

  // Determine active index from PROMPT_OPTIONS array
  const activeIndex = PROMPT_OPTIONS.findIndex(option => option.key === activeTab);

  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...prompts];
    newPrompts[index] = value;
    setPrompts(newPrompts);
    if (apiError) setApiError(null);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentPrompt = prompts[activeIndex];
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

      console.log("[AIForm] AI Response:", data);
      setCurrentResult(data);
      setShowModal(true);
      onAIRequest(data);
    } catch (error) {
      console.error("[AIForm] Error fetching data:", error);
      setApiError(error instanceof Error ? error.message : "Unknown error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
  };

  // Get placeholder from active tab option and type
  const getPlaceholder = () => {
    if (activeIndex === -1) return "";
    const promptKey = PROMPT_OPTIONS[activeIndex].promptKey;
    return t(getTypeKey(promptKey.sender, promptKey.hauler));
  };

  return (
    <div className={`ai-form ai-form--${type} ${className}`}>
      {/* Form Header */}
      <h3 className="ai-form__title">
        {t(getTypeKey("ai_form_title_sender", "ai_form_title_hauler"))}
      </h3>
      <p className="label label--description">
        {t(getTypeKey("ai_form_description_sender", "ai_form_description_hauler"))}
      </p>

      {/* Tabs UI: Render tab triggers with additional class based on type */}
      <Tabs
  value={activeTab} // Use value instead of defaultValue for controlled component
  onChange={setActiveTab}
  className={`ai-form__tabs ai-form__tabs--${type}`}
>
  <Tabs.List>
    {PROMPT_OPTIONS.map((option) => (
      <Tabs.Trigger key={option.key} value={option.key} role={type}>
        {t(option.key)}
      </Tabs.Trigger>
    ))}
  </Tabs.List>
</Tabs>

      {/* Form Content */}
      <form ref={containerRef} onSubmit={handleSearch} className="ai-form__tab-content">
        <textarea
          className="ai-form__textarea"
          placeholder={getPlaceholder()}
          value={prompts[activeIndex] || ""}
          onChange={(e) => handlePromptChange(activeIndex, e.target.value)}
          rows={4}
          disabled={isSubmitting}
        />
        {apiError && <div className="ai-form__error">{apiError}</div>}
        <Button
  type="submit"  
  variant="primary"
  role={type}
  disabled={isSubmitting || !prompts[activeIndex]?.trim()}
>
  {isSubmitting
    ? t("ai_button_processing") || "Processing..."
    : t(getTypeKey("ai_button_ask_sender", "ai_button_ask_hauler"))}
</Button>
      </form>

      {/* Modal for AI response */}
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
