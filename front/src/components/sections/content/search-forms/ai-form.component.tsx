// File: src/components/sections/content/search-forms/ai-form.component.tsx
// Last change: Fixed type compatibility with main AI types

import { useState, useEffect, useRef } from "react";
import { AIResponse } from "@/types/ai.types";

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
}

const AIForm: React.FC<AIFormProps> = ({ type, onAIRequest }) => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<ExtractedAIResponse | null>(null);
  const [maxWidth, setMaxWidth] = useState<number>(600);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const updateMaxWidth = () => {
      if (containerRef.current) {
        setMaxWidth(containerRef.current.offsetWidth);
      }
    };

    updateMaxWidth();
    window.addEventListener("resize", updateMaxWidth);

    return () => {
      window.removeEventListener("resize", updateMaxWidth);
    };
  }, []);

  const handleSearch = async () => {
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
          coordinates: rawData.coordinates
        }
      };

      console.log("AI Response:", data);
      setResult(data);
      onAIRequest(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div ref={containerRef} className={`ai-form--${type}`} style={{ maxWidth: "600px" }}>
      <textarea
        className="ai-form__textarea"
        placeholder={`Describe your ${type === "sender" ? "transportation" : "carrier"} needs`}
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
        style={{
          width: "100%",
          maxWidth: `${maxWidth}px`,
          minWidth: "200px",
        }}
      />
      <button className="ai-form__button" onClick={handleSearch}>
        {type === "sender" ? "Ask AI" : "Find Requests"}
      </button>

      {result && (
        <div className="ai-form__result">
          <h3>Extracted Data:</h3>
          <p>
            <strong>Pickup Location:</strong> {result.data.pickupLocation}
          </p>
          {result.data.coordinates?.pickup && (
            <p>
              GPS: {result.data.coordinates.pickup.lat}, {result.data.coordinates.pickup.lng}
            </p>
          )}
          <p>
            <strong>Delivery Location:</strong> {result.data.deliveryLocation}
          </p>
          {result.data.coordinates?.delivery && (
            <p>
              GPS: {result.data.coordinates.delivery.lat}, {result.data.coordinates.delivery.lng}
            </p>
          )}
          <p>
            <strong>Pickup Date:</strong> {result.data.pickupTime}
          </p>
          <p>
            <strong>Delivery Date:</strong> {result.data.deliveryTime}
          </p>
          <p>
            <strong>Weight:</strong> {result.data.weight}
          </p>
          <p>
            <strong>Number of Pallets:</strong> {result.data.palletCount}
          </p>
        </div>
      )}
    </div>
  );
};

export default AIForm;