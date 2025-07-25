// File: ./src/pages/TestPage.tsx
import React, { useState } from "react";

const TestPage: React.FC = () => {
  const [placeholder, setPlaceholder] = useState("Click to start typing...");
  const [inputValue, setInputValue] = useState("");
  const [cursorPosition, setCursorPosition] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    if (!isFocused) {
      setIsFocused(true);
    }
  };

  const handleBlur = () => {
    setPlaceholder("Click to start typing...");
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const cursorPos = e.target.selectionStart || 0;
    let updatedValue = inputValue;

    // Add the symbol and set cursor position after the first letter
    if (inputValue.length === 0 && e.target.value.length > 0) {
      updatedValue = e.target.value[0] + "⏎";
      setInputValue(updatedValue);
      setTimeout(() => {
        e.target.setSelectionRange(1, 1); // Place cursor between first letter and symbol
      }, 0);
      return;
    }

    const textWithoutSymbol = e.target.value.replace("⏎", "");

    // Update the value dynamically with the symbol at the end
    updatedValue = textWithoutSymbol + "⏎";
    setInputValue(updatedValue);

    // Move cursor to the correct position
    setTimeout(() => {
      if (cursorPos <= textWithoutSymbol.length) {
        e.target.setSelectionRange(cursorPos, cursorPos);
      } else {
        e.target.setSelectionRange(textWithoutSymbol.length, textWithoutSymbol.length);
        setInputValue(textWithoutSymbol + "⏎");
      }
    }, 0);
  };

  const handleCursor = (e: React.MouseEvent<HTMLTextAreaElement> | React.KeyboardEvent<HTMLTextAreaElement>) => {
    const cursorPos = e.currentTarget.selectionStart || 0;
    setCursorPosition(cursorPos);
  };

  // Split the input value into parts for rendering
  const parts = inputValue.split("⏎");
  const isSymbolBold = true;

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <style>
        {`
          .textarea-container {
            position: relative;
            width: 100%;
            height: 150px;
          }
          .textarea-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            padding: 10px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-sizing: border-box;
            resize: both;
            white-space: pre-wrap;
            word-wrap: break-word;
            overflow: hidden;
            pointer-events: none;
          }
          .textarea-overlay span {
            font-weight: normal;
          }
          .textarea-overlay .bold {
            font-weight: bold;
          }
          .hidden-textarea {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0;
            z-index: -1;
          }
        `}
      </style>
      <div className="textarea-container">
        <div className="textarea-overlay">
          {parts.map((part, index) => (
            <React.Fragment key={index}>
              <span className={cursorPosition !== null && cursorPosition > inputValue.indexOf("⏎") ? "bold" : ""}>
                {part}
              </span>
              {index < parts.length - 1 && <span className="bold">⏎</span>}
            </React.Fragment>
          ))}
        </div>
        <textarea
          className="hidden-textarea"
          value={inputValue}
          onChange={handleChange}
          onFocus={handleFocus}
          placeholder={placeholder}
          onBlur={handleBlur}
          onClick={handleCursor}
          onKeyUp={handleCursor}
          style={{
            width: "100%",
            height: "150px",
            padding: "10px",
            fontSize: "16px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxSizing: "border-box",
            resize: both",
          }}
        />
      </div>
      <div style={{ marginTop: "10px", fontSize: "14px", color: "#333" }}>
        <strong>Console Output:</strong>
        <pre
          style={{
            background: "#f4f4f4",
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ddd",
            whiteSpace: "pre-wrap",
            wordWrap: "break-word",
          }}
        >
          {inputValue}
        </pre>
        <p>Cursor Position: {cursorPosition}</p>
        <p>Text Style: {cursorPosition !== null && cursorPosition > inputValue.indexOf("⏎") ? "Bold" : "Normal"}</p>
      </div>
    </div>
  );
};

export default TestPage;