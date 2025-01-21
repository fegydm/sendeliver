// File: src/components/AISearchForm.tsx
// Last change: Removed TailwindCSS and all styles, translated to English

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

const AISearchForm = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<AIResponse | null>(null);

  const handleSearch = async () => {
    try {
      const response = await fetch("/api/ai/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: prompt,
          type: "sender",
          lang1: "en"
        }),
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const data = await response.json();
      console.log("AI Response:", data);
      setResult(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <textarea
        placeholder="Describe your transportation needs (e.g., 'I need to transport 2 pallets from Košice to Bratislava next Monday')"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
      />
      <button onClick={handleSearch}>Ask AI</button>

      {result && (
        <div>
          <h3>Extracted Data:</h3>
          <p><strong>Pickup Location:</strong> {result.pickupLocation}</p>
          {result.coordinates?.pickup && (
            <p>
              GPS: {result.coordinates.pickup.lat}, {result.coordinates.pickup.lng}
            </p>
          )}
          <p><strong>Delivery Location:</strong> {result.deliveryLocation}</p>
          {result.coordinates?.delivery && (
            <p>
              GPS: {result.coordinates.delivery.lat}, {result.coordinates.delivery.lng}
            </p>
          )}
          <p><strong>Pickup Date:</strong> {result.pickupTime}</p>
          <p><strong>Delivery Date:</strong> {result.deliveryTime}</p>
          <p><strong>Weight:</strong> {result.weight}</p>
          <p><strong>Number of Pallets:</strong> {result.palletCount}</p>
        </div>
      )}
    </div>
  );
};

export default AISearchForm;
