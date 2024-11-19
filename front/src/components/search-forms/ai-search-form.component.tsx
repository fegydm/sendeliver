// ./front/src/components/ai/ai-search-form.component.tsx
import React, { useState } from "react";

interface AiSearchProps {
  type: "client" | "carrier";
  onAIRequest: (prompt: string) => void;
}

const AiSearch: React.FC<AiSearchProps> = ({ type, onAIRequest }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [prompts, setPrompts] = useState([
    "I need to ship 10 pallets of electronics from Berlin to Prague tomorrow.",
    "Looking for a truck to transport 500kg of goods from Paris to Lyon.",
    "Need a refrigerated vehicle for frozen food delivery from Hamburg to Vienna.",
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

  const magentaBg = "bg-magenta-500/10"; // Prispôsobte podľa Tailwind konfigurácie
  const magentaBorder = "border-magenta-500/20";
  const magentaButton = "bg-magenta-500 hover:bg-magenta-500/80";

  return (
    <div className={`p-6 ${magentaBg} border-t-2 ${magentaBorder}`}>
      <div className="mb-4 text-lg font-semibold text-magenta-700 dark:text-magenta-300">
        Need to send something and find the perfect carrier? Ask AI or fill out
        the form.
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 mb-4">
        {prompts.map((_, index) => (
          <button
            key={index}
            onClick={() => setActiveTab(index)}
            className={`py-2 px-4 rounded-md border ${
              activeTab === index
                ? "bg-magenta-500 text-white"
                : "bg-white dark:bg-gray-700 dark:text-white"
            }`}
          >
            Tab {index + 1}
          </button>
        ))}
      </div>

      {/* Textarea and Button */}
      <div className="relative">
        <textarea
          placeholder="Write your request here..."
          className="w-full p-4 border rounded-lg h-24 bg-white/90 dark:bg-gray-800 dark:text-white"
          value={prompts[activeTab]}
          onChange={(e) => {
            const updatedPrompts = [...prompts];
            updatedPrompts[activeTab] = e.target.value;
            setPrompts(updatedPrompts);
          }}
        />
        <button
          onClick={handleAIRequest}
          className={`absolute -bottom-4 left-4 px-6 py-3 rounded-md text-white transition-colors ${magentaButton}`}
        >
          Ask AI
        </button>
      </div>

      {/* Display Results */}
      {results[activeTab] && (
        <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg border dark:border-gray-700">
          <strong>Result:</strong> {results[activeTab]}
        </div>
      )}
    </div>
  );
};

export default AiSearch;
