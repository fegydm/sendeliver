// File: src/components/sections/footers/footer-test.component.tsx
import React, { useState, useEffect } from "react";
import ThemeSwitcher from "@/components/elements/theme-switcher.element";
import ThemeEditorModal from "@/components/modals/theme-editor.modal";
import ColorPaletteModal from "@/components/modals/color-palette.modal";
import { Button } from "@/components/ui";
import KeystrokeAndQueryTiming from "@/components/KeystrokeAndQueryTiming"; // Import the timing component

interface FooterTestProps {
  isVisible: boolean;
  onClose: () => void;
}

// Prefixes for app logs we want to capture
const APP_LOG_PREFIXES = [
  'Rows selected:',
  'Search results:',
  'API call:',
  'Loaded:'
];

const FooterTest: React.FC<FooterTestProps> = ({ isVisible, onClose }) => {
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [systemLogs, setSystemLogs] = useState<string[]>([]);
  const [appLogs, setAppLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"warnings" | "errors" | "system" | "app">("warnings");
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);

  useEffect(() => {
    const originalWarn = console.warn;
    const originalError = console.error;
    const originalLog = console.log;

    // Capture React and system warnings
    console.warn = (...args) => {
      const message = args.join(" ");
      if (message.includes("React") || message.includes("Warning:")) {
        setWarnings(prev => [...prev, message]);
      }
      originalWarn(...args);
    };

    // Capture actual errors with safe formatting
    console.error = (...args) => {
      const formattedError = args.map(arg => {
        if (typeof arg === "object") {
          // If error message starts with HTML doctype, return it directly
          if (arg && typeof arg.message === "string" && arg.message.trim().startsWith("<!doctype")) {
            return arg.message;
          }
          try {
            return JSON.stringify(arg, null, 2);
          } catch (err) {
            return String(arg);
          }
        }
        return arg;
      }).join(" ");
      
      if (formattedError.includes("Error:") || formattedError.includes("Exception:")) {
        setErrors(prev => [...prev, formattedError]);
      }
      originalError(...args);
    };

    // Capture system and app logs
    console.log = (...args) => {
      const message = args.join(" ");
      
      // System logs
      if (message.includes("System:") || message.includes("[System]")) {
        setSystemLogs(prev => [...prev, message]);
      }
      
      // App logs with specific prefixes
      if (APP_LOG_PREFIXES.some(prefix => message.startsWith(prefix))) {
        setAppLogs(prev => [...prev, message]);
      }
      
      originalLog(...args);
    };

    return () => {
      console.warn = originalWarn;
      console.error = originalError;
      console.log = originalLog;
    };
  }, []);

  if (!isVisible) return null;

  return (
    <footer className="footer-test flex h-screen w-full">
      <div className="footer-test__left flex flex-1 flex-col border-r border-gray-200 p-5">
        <Button variant="secondary" onClick={onClose}>Close Footer</Button>
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
      </div>

      <div className="footer-test__right flex-2 overflow-y-auto p-5">
        <h2 className="text-xl font-bold mb-4">System Monitoring</h2>
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setActiveTab("warnings")}
            className={`px-4 py-2 rounded ${activeTab === "warnings" ? "bg-yellow-500 text-white" : "bg-gray-200"}`}
          >
            Warnings ({warnings.length})
          </button>
          <button
            onClick={() => setActiveTab("errors")}
            className={`px-4 py-2 rounded ${activeTab === "errors" ? "bg-red-500 text-white" : "bg-gray-200"}`}
          >
            Errors ({errors.length})
          </button>
          <button
            onClick={() => setActiveTab("system")}
            className={`px-4 py-2 rounded ${activeTab === "system" ? "bg-blue-500 text-white" : "bg-gray-200"}`}
          >
            System ({systemLogs.length})
          </button>
          <button
            onClick={() => setActiveTab("app")}
            className={`px-4 py-2 rounded ${activeTab === "app" ? "bg-green-500 text-white" : "bg-gray-200"}`}
          >
            App Logs ({appLogs.length})
          </button>
        </div>
        
        <div className="max-h-[calc(100vh-300px)] overflow-y-auto mb-4">
          {activeTab === "warnings" && warnings.map((warning, index) => (
            <p key={index} className="text-yellow-600 mb-2 p-2 bg-yellow-50 rounded">
              {warning}
            </p>
          ))}
          {activeTab === "errors" && errors.map((error, index) => (
            <p key={index} className="text-red-600 mb-2 p-2 bg-red-50 rounded">
              {error}
            </p>
          ))}
          {activeTab === "system" && systemLogs.map((log, index) => (
            <p key={index} className="text-blue-600 mb-2 p-2 bg-blue-50 rounded">
              {log}
            </p>
          ))}
          {activeTab === "app" && appLogs.map((log, index) => (
            <p key={index} className="text-green-600 mb-2 p-2 bg-green-50 rounded">
              {log}
            </p>
          ))}
        </div>

        {/* Insert the Keystroke and SQL Query Timing component for testing */}
        <div className="mb-4">
          <h2 className="text-xl font-bold mb-2">Keystroke & Query Timing Test</h2>
          <KeystrokeAndQueryTiming />
        </div>
      </div>

      <ThemeEditorModal
        isOpen={isThemeEditorOpen}
        onClose={() => setIsThemeEditorOpen(false)}
        onSave={(data) => console.log("[System]: Theme data saved:", data)}
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
