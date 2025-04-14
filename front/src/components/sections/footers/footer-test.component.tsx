// File: src/components/sections/footers/footer-test.component.tsx
// Last change: Updated log filtering to allow map-related logs in console but hide from UI

import React, { useState, useEffect } from "react";
import ThemeSwitcher from "@/components/elements/theme-switcher.element";
import ThemeEditorModal from "@/components/modals/theme-editor.modal";
import ColorPaletteModal from "@/components/modals/color-palette.modal";
import { Button } from "@/components/ui";
import KeystrokeAndQueryTiming from "@/components/KeystrokeAndQueryTiming";
import "./footer-test.component.css";

// Define excluded log prefixes to filter out from UI but still show in console
const EXCLUDED_FROM_UI_PREFIXES = ['[MapRenderer]', '[CarMap:', '[VehicleRenderer]'];

interface FooterTestProps {
  isVisible: boolean;
  onClose: () => void;
}

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
  
    console.warn = (...args) => {
      const message = args.join(" ");
      
      // Always pass to original console for debugging
      originalWarn(...args);
      
      // Check if message should be excluded from UI
      if (EXCLUDED_FROM_UI_PREFIXES.some(prefix => message.startsWith(prefix) || message.includes(prefix))) {
        return; // Don't update state, but still logged to console above
      }
      
      // Update state for UI display
      if (message.includes("React") || message.includes("Warning:")) {
        setWarnings(prev => [...prev, message]);
      }
    };
  
    console.error = (...args) => {
      const formattedError = args.map(arg => {
        if (typeof arg === "object") {
          if (arg?.message?.trim().startsWith("<!doctype")) {
            return arg.message;
          }
          try {
            return JSON.stringify(arg, null, 2);
          } catch {
            return String(arg);
          }
        }
        return arg;
      }).join(" ");
      
      // Always pass to original console for debugging
      originalError(...args);
      
      // Check if error should be excluded from UI
      if (EXCLUDED_FROM_UI_PREFIXES.some(prefix => formattedError.startsWith(prefix) || formattedError.includes(prefix))) {
        return; // Don't update state, but still logged to console above
      }
      
      // Update state for UI display
      if (formattedError.includes("Error:") || formattedError.includes("Exception:")) {
        setErrors(prev => [...prev, formattedError]);
      }
    };
  
    console.log = (...args) => {
      const message = args.join(" ");
      
      // Always pass to original console for debugging
      originalLog(...args);
      
      // Check if message should be excluded from UI
      if (EXCLUDED_FROM_UI_PREFIXES.some(prefix => message.startsWith(prefix) || message.includes(prefix))) {
        return; // Don't update state, but still logged to console above
      }
      
      // Update states for UI display
      if (message.includes("System:") || message.includes("[System]")) {
        setSystemLogs(prev => [...prev, message]);
      }
      
      if (APP_LOG_PREFIXES.some(prefix => message.startsWith(prefix))) {
        setAppLogs(prev => [...prev, message]);
      }
    };
  
    return () => {
      console.warn = originalWarn;
      console.error = originalError;
      console.log = originalLog;
    };
  }, []);

  if (!isVisible) return null;

  return (
    <footer className="footer-test">
      <div className="footer-test__left">
        <Button variant="secondary" onClick={onClose}>Close Footer</Button>
        <div className="theme-switcher-wrapper">
          <ThemeSwitcher is3DMode={is3DMode} />
        </div>
        <Button variant="secondary" onClick={() => setIs3DMode(prev => !prev)}>
          {is3DMode ? "Switch to 2D" : "Switch to 3D"}
        </Button>
        <Button variant="secondary" onClick={() => setIsThemeEditorOpen(true)}>
          Theme Editor
        </Button>
        <Button variant="secondary" onClick={() => setIsColorPaletteOpen(true)}>
          Color Palette
        </Button>
        <div className="url-testing">
          <a href="/luky" target="_blank">Test luky video</a>
          <a href="./jozo" target="_blank">Test jozo video</a>
        </div>
      </div>
      <div className="footer-test__right">
        <h2 className="heading">System Monitoring</h2>
        <div className="tab-buttons">
          <button onClick={() => setActiveTab("warnings")} className={`tab-button warnings ${activeTab === "warnings" ? "active" : ""}`}>
            Warnings ({warnings.length})
          </button>
          <button onClick={() => setActiveTab("errors")} className={`tab-button errors ${activeTab === "errors" ? "active" : ""}`}>
            Errors ({errors.length})
          </button>
          <button onClick={() => setActiveTab("system")} className={`tab-button system ${activeTab === "system" ? "active" : ""}`}>
            System ({systemLogs.length})
          </button>
          <button onClick={() => setActiveTab("app")} className={`tab-button app ${activeTab === "app" ? "active" : ""}`}>
            App Logs ({appLogs.length})
          </button>
        </div>
        <div className="logs-container">
          {activeTab === "warnings" && warnings.map((warning, index) => (
            <p key={index} className="log-message warning">
              {warning}
            </p>
          ))}
          {activeTab === "errors" && errors.map((error, index) => (
            <p key={index} className="log-message error">
              {error}
            </p>
          ))}
          {activeTab === "system" && systemLogs.map((log, index) => (
            <p key={index} className="log-message system">
              {log}
            </p>
          ))}
          {activeTab === "app" && appLogs.map((log, index) => (
            <p key={index} className="log-message app">
              {log}
            </p>
          ))}
        </div>
        <div className="timing-container">
          <h2 className="heading-sub">Keystroke & Query Timing Test</h2>
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
          "height-footer": "180px",
          "height-banner": "250px",
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