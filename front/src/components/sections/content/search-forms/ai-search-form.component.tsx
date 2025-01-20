// File: src/components/AISearchForm.tsx
// Last change: Fixed API request format and response type

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
          lang1: "sk"
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
    <div className="p-4">
      <textarea
        className="w-full p-2 border rounded-lg mb-4"
        placeholder="Opíšte vaše prepravné potreby (napr. 'Potrebujem odviezť 2 palety z Košíc do Bratislavy budúci pondelok')"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        rows={4}
      />
      <button 
        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        onClick={handleSearch}
      >
        Spýtať sa AI
      </button>

      {result && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="font-bold mb-2">Extrahované údaje:</h3>
          <p><strong>Nakládka:</strong> {result.pickupLocation}</p>
          {result.coordinates?.pickup && (
            <p className="ml-4 text-sm text-gray-600">
              GPS: {result.coordinates.pickup.lat}, {result.coordinates.pickup.lng}
            </p>
          )}
          <p><strong>Vykládka:</strong> {result.deliveryLocation}</p>
          {result.coordinates?.delivery && (
            <p className="ml-4 text-sm text-gray-600">
              GPS: {result.coordinates.delivery.lat}, {result.coordinates.delivery.lng}
            </p>
          )}
          <p><strong>Dátum nakládky:</strong> {result.pickupTime}</p>
          <p><strong>Dátum vykládky:</strong> {result.deliveryTime}</p>
          <p><strong>Váha:</strong> {result.weight}</p>
          <p><strong>Počet paliet:</strong> {result.palletCount}</p>
        </div>
      )}
    </div>
  );
};

export default AISearchForm;