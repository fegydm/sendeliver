// File: src/components/sections/content/search-forms/ai-form.component.tsx
// Last change: Added className prop and aligned with HomePage

import { useState, useEffect, useRef } from "react";
import { AIResponse } from "@/types/transport-forms.types";

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
  className?: string; // Added for parent styling
}

const AIForm: React.FC<AIFormProps> = ({ type, onAIRequest, className = '' }) => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<ExtractedAIResponse | null>(null);
  const containerRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    // English comment: No longer setting maxWidth dynamically since it's handled by CSS
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          type,
          lang1: "en",
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const rawData = await response.json();
      
      // Transform the response to match ExtractedAIResponse format
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

      console.log("AI Response:", data);
      setResult(data);
      onAIRequest(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <form 
      ref={containerRef} 
      className={`ai-form ai-form--${type} ${className}`} 
      onSubmit={handleSearch}
    >
      <textarea
        className="ai-form__textarea"
        placeholder={`Describe your ${type === "sender" ? "transportation" : "carrier"} needs`}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
      />
      <button type="submit" className="ai-form__button">
        {type === "sender" ? "Ask AI" : "Find Requests"}
      </button>

      {result && (
        <div className="ai-form__result">
          <h3 className="ai-form__result-title">Extracted Data:</h3>
          <div className="ai-form__result-item">
            <strong className="ai-form__result-label">Pickup Location:</strong>
            <span className="ai-form__result-value">{result.data.pickupLocation}</span>
          </div>
          
          {result.data.coordinates?.pickup && (
            <div className="ai-form__result-item">
              <strong className="ai-form__result-label">GPS:</strong>
              <span className="ai-form__result-value">
                {result.data.coordinates.pickup.lat}, {result.data.coordinates.pickup.lng}
              </span>
            </div>
          )}
          
          <div className="ai-form__result-item">
            <strong className="ai-form__result-label">Delivery Location:</strong>
            <span className="ai-form__result-value">{result.data.deliveryLocation}</span>
          </div>
          
          {result.data.coordinates?.delivery && (
            <div className="ai-form__result-item">
              <strong className="ai-form__result-label">GPS:</strong>
              <span className="ai-form__result-value">
                {result.data.coordinates.delivery.lat}, {result.data.coordinates.delivery.lng}
              </span>
            </div>
          )}
          
          <div className="ai-form__result-item">
            <strong className="ai-form__result-label">Pickup Date:</strong>
            <span className="ai-form__result-value">{result.data.pickupTime}</span>
          </div>
          
          <div className="ai-form__result-item">
            <strong className="ai-form__result-label">Delivery Date:</strong>
            <span className="ai-form__result-value">{result.data.deliveryTime}</span>
          </div>
          
          <div className="ai-form__result-item">
            <strong className="ai-form__result-label">Weight:</strong>
            <span className="ai-form__result-value">{result.data.weight}</span>
          </div>
          
          <div className="ai-form__result-item">
            <strong className="ai-form__result-label">Number of Pallets:</strong>
            <span className="ai-form__result-value">{result.data.palletCount}</span>
          </div>
        </div>
      )}
    </form>
  );
};

export default AIForm;