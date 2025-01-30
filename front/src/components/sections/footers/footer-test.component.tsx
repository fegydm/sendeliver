// File: front/src/components/sections/footers/footer-test.component.tsx
// Last change: Added manual search trigger to prevent automatic API calls

import React, { useState, useEffect } from "react";
import ThemeSwitcher from "@/components/elements/theme-switcher.element";
import ThemeEditorModal from "@/components/modals/theme-editor.modal";
import ColorPaletteModal from "@/components/modals/color-palette.modal";
import { Button } from "@/components/ui";

interface FooterTestProps {
  isVisible: boolean;
  onClose: () => void;
}

const FooterTest: React.FC<FooterTestProps> = ({ isVisible, onClose }) => {
  const [postalCode, setPostalCode] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"logs" | "warnings" | "errors">("logs");
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);
  const [shouldSearch, setShouldSearch] = useState(false);

  // Handle search button click
  const handleSearch = () => {
    if (postalCode.trim().length >= 3) {
      setShouldSearch(prev => !prev); // Toggle to trigger useEffect
    }
  };

  useEffect(() => {
    // Only fetch when footer is visible and search is triggered
    if (!isVisible) return;
    
    const fetchLocations = async () => {
      try {
        const response = await fetch(`/api/geo/location?postalCode=${postalCode}`);
  
        if (!response.ok) {
          throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
        }
  
        const data = await response.json();
        console.log("Fetched data from API:", JSON.stringify(data, null, 2));

        // Process response data safely
        let results;
        let totalCount;

        if (Array.isArray(data)) {
          // If response is directly an array
          results = data;
          totalCount = data.length;
        } else if (data.results && Array.isArray(data.results)) {
          // If response has { results: [...] } structure
          results = data.results;
          totalCount = data.total_count || results.length;
        } else {
          // If response has different structure, try to find array
          const firstArrayKey = Object.keys(data).find(key => Array.isArray(data[key]));
          results = firstArrayKey ? data[firstArrayKey] : [];
          totalCount = results.length;
        }

        setLogs(prev => [...prev, `Fetched ${results.length} locations (Total: ${totalCount})`]);
  
      } catch (error: unknown) {
        let errorMessage = "Unknown error";
        if (error instanceof Error) {
          errorMessage = error.message;
        }
  
        console.error("Search error:", errorMessage);
        setErrors(prev => [...prev, `Search error: ${errorMessage}`]);
      }
    };
  
    fetchLocations();
  }, [isVisible, shouldSearch]); // Only run effect when visibility changes or search is triggered
  

  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      setLogs(prev => [...prev, args.join(" ")]);
      originalLog(...args);
    };

    console.warn = (...args) => {
      setWarnings(prev => [...prev, args.join(" ")]);
      originalWarn(...args);
    };

    console.error = (...args) => {
      const formattedError = args
        .map(arg => (typeof arg === "object" ? JSON.stringify(arg, null, 2) : arg))
        .join(" ");
    
      setErrors(prev => [...prev, formattedError]);
      originalError(...args);
    };
    
    // Cleanup console overrides
    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  if (!isVisible) return null;

  return (
    <footer className="footer-test" style={{ display: "flex", height: "100vh", width: "100%" }}>
      {/* Left Section */}
      <div
        className="footer-test__left"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          borderRight: "1px solid #ccc",
        }}
      >
        <Button variant="secondary" onClick={onClose}>
          Close Footer
        </Button>
        <div style={{ marginTop: "20px", marginBottom: "20px" }}>
          <input
            type="text"
            value={postalCode}
            onChange={(e) => setPostalCode(e.target.value)}
            placeholder="Enter postal code"
            className="p-2 border rounded"
          />
          <Button 
            variant="secondary" 
            onClick={handleSearch}
            style={{ marginLeft: '10px' }}
          >
            Search
          </Button>
        </div>
        <ThemeSwitcher is3DMode={is3DMode} />
        <Button variant="secondary" onClick={() => setIs3DMode(prev => !prev)}>
          {is3DMode ? "Switch to 2D" : "Switch to 3D"}
        </Button>
        <Button variant="secondary" onClick={() => setIsThemeEditorOpen(true)}>
          Theme Editor
        </Button>
        <Button variant="secondary" onClick={() => setIsColorPaletteOpen(true)}>
          Color Palette
        </Button>
        <div style={{ marginTop: "20px" }}>
          <h2>Test Links</h2>
          <ul>
            <li>
              <a href="/jozo" className="footer-link">
                Test Jozo
              </a>
            </li>
            <li>
              <a href="/luky" className="footer-link">
                Test Luky
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Section */}
      <div
        className="footer-test__right"
        style={{
          flex: 2,
          padding: "20px",
          overflowY: "auto",
        }}
      >
        <h1>Logs</h1>
        <div style={{ display: "flex", gap: "10px", marginBottom: "10px" }}>
          <button onClick={() => setActiveTab("logs")} className={activeTab === "logs" ? "active" : ""}>
            Logs
          </button>
          <button onClick={() => setActiveTab("warnings")} className={activeTab === "warnings" ? "active" : ""}>
            Warnings
          </button>
          <button onClick={() => setActiveTab("errors")} className={activeTab === "errors" ? "active" : ""}>
            Errors
          </button>
        </div>
        <div>
          {activeTab === "logs" && logs.map((log, index) => <p key={index}>{log}</p>)}
          {activeTab === "warnings" && warnings.map((warn, index) => <p key={index} style={{ color: "orange" }}>{warn}</p>)}
          {activeTab === "errors" && errors.map((error, index) => <p key={index} style={{ color: "red" }}>{error}</p>)}
        </div>
      </div>

      {/* Modals */}
      <ThemeEditorModal
        isOpen={isThemeEditorOpen}
        onClose={() => setIsThemeEditorOpen(false)}
        onSave={(data) => console.log("Saved theme data:", data)}
        editorData={{
          "color-page-bg": "#ffffff",
          "color-navbar-bg": "#f8f9fa",
          "color-footer-bg": "#f1f1f1",
          "color-modal-bg": "#ffffff",
          "color-text-primary": "#212529",
          "color-text-secondary": "#6c757d",
          "height-header": "100px",
          "height-footer": "200px",
          "height-banner": "300px",
          "modal-offset-top": "20px",
          "font-size-base": "16px",
          "font-size-lg": "20px",
          "font-size-sm": "14px",
          "spacing-xs": "4px",
          "spacing-sm": "8px",
          "spacing-md": "16px",
          "spacing-lg": "24px",
        }}
      />
      <ColorPaletteModal
        isOpen={isColorPaletteOpen}
        onClose={() => setIsColorPaletteOpen(false)}
      />
    </footer>
  );
};

export default FooterTest;