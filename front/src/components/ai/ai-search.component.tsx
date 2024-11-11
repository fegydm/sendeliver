// ./front/src/components/ai/ai-search.component.tsx
import React, { useState } from 'react';

interface AiSearchProps {
  type: 'client' | 'carrier';
  onAIRequest: (prompt: string) => void;
}

const AiSearch: React.FC<AiSearchProps> = ({ type, onAIRequest }) => {
  const [prompt, setPrompt] = useState('');
  const bgColor = type === 'client' ? 'bg-[#FF00FF]/10' : 'bg-[#74cc04]/10';
  const borderColor = type === 'client' ? 'border-[#FF00FF]/20' : 'border-[#74cc04]/20';
  const buttonBgColor = type === 'client' ? 'bg-[#FF00FF] hover:bg-[#FF00FF]/80' : 'bg-[#74cc04] hover:bg-[#74cc04]/80';

  const handleAIRequest = () => {
    if (!prompt.trim()) return;
    onAIRequest(prompt);
    setPrompt('');
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