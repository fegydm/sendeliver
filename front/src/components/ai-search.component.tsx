import React, { useState } from 'react';

interface AiSearchProps {
  type: 'client' | 'carrier'; // Definovanie typu pre parameter
}

const AiSearch: React.FC<AiSearchProps> = ({ type }) => {
  const [prompt, setPrompt] = useState('');
  const bgColor = type === 'client' ? 'bg-[#FF00FF]/10' : 'bg-[#74cc04]/10';
  const borderColor = type === 'client' ? 'border-[#FF00FF]/20' : 'border-[#74cc04]/20';

  return (
    <div className={`p-6 ${bgColor} border-t-2 ${borderColor}`}>
      <div className="relative">
        <textarea
          placeholder={type === 'client' 
            ? "Describe your cargo needs to AI..." 
            : "Describe your vehicle availability to AI..."}
          className="w-full p-4 border rounded-lg h-24 bg-white/90"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
        />
        <button 
          className={`absolute bottom-2 right-2 px-4 py-1 rounded-full text-white transition-colors
            ${type === 'client' ? 'bg-[#FF00FF] hover:bg-[#FF00FF]/80' : 'bg-[#74cc04] hover:bg-[#74cc04]/80'}`}
        >
          Ask AI
        </button>
      </div>
    </div>
  );
};

export default AiSearch;
