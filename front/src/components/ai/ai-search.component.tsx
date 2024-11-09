// ./front/src/components/ai-search.component.tsx
import React, { useState } from 'react';

interface AiSearchProps {
  type: 'client' | 'carrier';
  onAIRequest?: (prompt: string) => void;
  onDataExtracted?: (data: any) => void;
}

interface TransportData {
  pickup?: string;
  pickupTime?: string;
  delivery?: string;
  deliveryTime?: string;
  weight?: string;
  pallets?: number;
}

const AiSearch: React.FC<AiSearchProps> = ({ type, onAIRequest, onDataExtracted }) => {
  const [prompt, setPrompt] = useState('');
  const bgColor = type === 'client' ? 'bg-[#FF00FF]/10' : 'bg-[#74cc04]/10';
  const borderColor = type === 'client' ? 'border-[#FF00FF]/20' : 'border-[#74cc04]/20';
  const buttonBgColor = type === 'client' ? 'bg-[#FF00FF] hover:bg-[#FF00FF]/80' : 'bg-[#74cc04] hover:bg-[#74cc04]/80';

  const handleAIRequest = () => {
    if (!prompt.trim() || !onAIRequest) return;
    
    onAIRequest(prompt);

    // Môžeme pridať základnú extrakciu dát z textu
    // Toto je len príklad, v realite by ste použili AI pre extrakciu
    const mockData: TransportData = {
      pickup: 'Dortmund',
      delivery: 'Paríž',
      weight: '280',
      pallets: 3
    };

    onDataExtracted?.(mockData);
  };

  return (
    <div className={`p-6 ${bgColor} border-t-2 ${borderColor}`}>
      <div className="relative">
        <textarea
          placeholder={type === 'client' 
            ? "Popíšte požiadavky na prepravu..." 
            : "Popíšte dostupnosť vozidla..."}
          className="w-full p-4 border rounded-lg h-24 bg-white/90 dark:bg-gray-800 dark:text-white"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button 
          onClick={handleAIRequest}
          className={`absolute bottom-2 right-2 px-4 py-1 rounded-full text-white transition-colors ${buttonBgColor}`}
        >
          Spýtať sa AI
        </button>
      </div>
    </div>
  );
};

export default AiSearch;