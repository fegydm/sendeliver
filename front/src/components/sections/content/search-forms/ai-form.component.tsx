// File: src/components/sections/content/search-forms/ai-form.component.tsx
// Last change: Restored functionality from AISearchForm

import { useState } from "react";

interface Coordinates {
  lat: number;
  lng: number;
}

interface AIResponse {
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
}

interface AIFormProps {
  type: "sender" | "hauler";
  onAIRequest: (response: AIResponse) => void;
}

const AIForm: React.FC<AIFormProps> = ({ type, onAIRequest }) => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<AIResponse | null>(null);

  const handleSearch = async () => {
    try {
      const response = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: prompt,
          type,
          lang1: "en", // Hardcoded language for now
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      console.log("AI Response:", data);
      setResult(data);
      onAIRequest(data); // Pass response to parent
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div className={`ai-form--${type}`}>
      <textarea
        className="ai-form__textarea"
        placeholder={`Describe your ${type === "sender" ? "transportation" : "carrier"} needs`}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
      />
      <button className="ai-form__button" onClick={handleSearch}>
        {type === "sender" ? "Ask AI" : "Find Requests"}
      </button>

      {result && (
        <div className="ai-form__result">
          <h3>Extracted Data:</h3>
          <p>
            <strong>Pickup Location:</strong> {result.pickupLocation}
          </p>
          {result.coordinates?.pickup && (
            <p>
              GPS: {result.coordinates.pickup.lat}, {result.coordinates.pickup.lng}
            </p>
          )}
          <p>
            <strong>Delivery Location:</strong> {result.deliveryLocation}
          </p>
          {result.coordinates?.delivery && (
            <p>
              GPS: {result.coordinates.delivery.lat}, {result.coordinates.delivery.lng}
            </p>
          )}
          <p>
            <strong>Pickup Date:</strong> {result.pickupTime}
          </p>
          <p>
            <strong>Delivery Date:</strong> {result.deliveryTime}
          </p>
          <p>
            <strong>Weight:</strong> {result.weight}
          </p>
          <p>
            <strong>Number of Pallets:</strong> {result.palletCount}
          </p>
        </div>
      )}
    </div>
  );
};

export default AIForm;
