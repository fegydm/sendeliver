import { useState } from "react";

const AISearchForm = () => {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<{ location: string; coordinates: { lat: number; lng: number } } | null>(null);

  const handleSearch = async () => {
    try {
      const response = await fetch("/api/extract-location-with-coordinates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      console.log("Extracted data:", data); // Output to console
      setResult(data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  return (
    <div>
      <textarea
        placeholder="Describe your transport needs (e.g., 'Find a truck for tomorrow from Prague to Kosice')"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button onClick={handleSearch}>Ask AI</button>

      {result && (
        <div>
          <p>Extracted Location: {result.location}</p>
          <p>Coordinates: Latitude {result.coordinates.lat}, Longitude {result.coordinates.lng}</p>
        </div>
      )}
    </div>
  );
};

export default AISearchForm;
