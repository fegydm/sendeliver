// File: front/src/components/sections/footers/footer-test.component.tsx
// Last change: Updated layout with "Close Footer" on top and buttons for modals

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
  const [logs, setLogs] = useState<string[]>([]);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"logs" | "warnings" | "errors">(
    "logs"
  );
  const [isThemeEditorOpen, setIsThemeEditorOpen] = useState(false);
  const [isColorPaletteOpen, setIsColorPaletteOpen] = useState(false);
  const [is3DMode, setIs3DMode] = useState(false);

  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = (...args) => {
      setLogs((prev) => [...prev, args.join(" ")]);
      originalLog(...args);
    };

    console.warn = (...args) => {
      setWarnings((prev) => [...prev, args.join(" ")]);
      originalWarn(...args);
    };

    console.error = (...args) => {
      setErrors((prev) => [...prev, args.join(" ")]);
      originalError(...args);
    };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  if (!isVisible) return null;

  return (
    <footer
      style={{
        display: "flex",
        width: "100%",
        height: "100vh",
        margin: 0,
      }}
    >
      {/* Left Section */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Button variant="secondary" onClick={onClose}>
          Close Footer
        </Button>
        <ThemeSwitcher is3DMode={is3DMode} />
        <Button
          variant="secondary"
          onClick={() => setIs3DMode((prev) => !prev)}
        >
          {is3DMode ? "Switch to 2D" : "Switch to 3D"}
        </Button>
        <Button
          variant="secondary"
          onClick={() => setIsThemeEditorOpen(true)}
        >
          Theme Editor
        </Button>
        <Button
          variant="secondary"
          onClick={() => setIsColorPaletteOpen(true)}
        >
          Color Palette
        </Button>
        <div style={{ marginTop: "20px" }}>
          <h2>Test Links</h2>
          <ul>
            <li>
              <a href="url/jozo">Test Jozo</a>
            </li>
            <li>
              <a href="url/luky">Test Luky</a>
            </li>
          </ul>
        </div>
      </div>

      {/* Right Section */}
      <div
        style={{
          flex: 1,
          padding: "20px",
          borderLeft: "1px solid #ccc",
          overflowY: "auto",
        }}
      >
        <h1>Logs</h1>
        <div>
          <button onClick={() => setActiveTab("logs")}>Logs</button>
          <button onClick={() => setActiveTab("warnings")}>Warnings</button>
          <button onClick={() => setActiveTab("errors")}>Errors</button>
        </div>
        <div style={{ marginTop: "10px" }}>
          {activeTab === "logs" &&
            logs.map((log, index) => <p key={index}>{log}</p>)}
          {activeTab === "warnings" &&
            warnings.map((warn, index) => <p key={index}>{warn}</p>)}
          {activeTab === "errors" &&
            errors.map((error, index) => <p key={index}>{error}</p>)}
        </div>
      </div>

      {/* Modals */}
      <ThemeEditorModal
        isOpen={isThemeEditorOpen}
        onClose={() => setIsThemeEditorOpen(false)}
        onSave={(data) => console.log("Saved theme data:", data)}
        editorData={{}}
      />
      <ColorPaletteModal
        isOpen={isColorPaletteOpen}
        onClose={() => setIsColorPaletteOpen(false)}
      />
    </footer>
  );
};

export default FooterTest;
