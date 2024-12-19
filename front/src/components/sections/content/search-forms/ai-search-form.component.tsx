// ./front/src/components/ai/ai-search-form.component.tsx
import React, { useState } from "react";

interface AiSearchProps {
  type: "client" | "carrier";
  onAIRequest: (prompt: string) => void;
}

const AiSearch: React.FC<AiSearchProps> = ({ type: _type, onAIRequest }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [prompts, setPrompts] = useState([
    _type === "client"
      ? "I need to ship 10 pallets of electronics from Berlin to Prague tomorrow."
      : "Tomorrow I have an available truck in Brussels. Find me a load heading to Poland.",
    _type === "client"
      ? "Looking for a truck to transport 500kg of goods from Paris to Lyon."
      : "Looking for transport today from Hamburg to Bucharest, max 1100kg, already free, tarpaulin van.",
    _type === "client"
      ? "Need a refrigerated vehicle for frozen food delivery from Hamburg to Vienna."
      : "On Friday, I will be unloading a truck in Bratislava. Find me any load nearby."
  ]);
  const [results, setResults] = useState<string[]>(["", "", ""]);

  const handleAIRequest = () => {
    const currentPrompt = prompts[activeTab];
    if (!currentPrompt.trim()) return;

    onAIRequest(currentPrompt);
    const updatedResults = [...results];
    updatedResults[activeTab] = `Result for: ${currentPrompt}`;
    setResults(updatedResults);
  };

  return (
    <div className={`ai-search-form ${_type === "carrier" ? "carrier" : ""}`}>
      {/* Title */}
      <div className={`ai-search-title ${_type === "carrier" ? "carrier" : ""}`}>
        {_type === "client"
          ? "Need to send something and find the perfect carrier? Ask AI or fill out the form."
          : "Need to find a suitable load for your truck? Ask AI or fill out the relevant form."}
      </div>

      {/* Tabs */}
      <div className="ai-search-tabs">
        {prompts.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`ai-search-tab ${activeTab === index ? "active" : ""} ${
              _type === "carrier" ? "carrier" : ""
            }`}
          >
            Tab {index + 1}
          </button>
        ))}
      </div>

      {/* Textarea and Button */}
      <div className="ai-search-input">
        <textarea
          placeholder="Write your request here..."
          value={prompts[activeTab]}
          onChange={(e) => {
            const updatedPrompts = [...prompts];
            updatedPrompts[activeTab] = e.target.value;
            setPrompts(updatedPrompts);
          }}
        />
        <button
          onClick={handleAIRequest}
          className={`ai-search-button ${_type === "carrier" ? "carrier" : ""}`}
        >
          Ask AI
        </button>
      </div>

      {/* Display Results */}
      {results[activeTab] && (
        <div className="ai-search-result">
          <strong>Result:</strong> {results[activeTab]}
        </div>
      )}
    </div>
  );
};

export default AiSearch;
