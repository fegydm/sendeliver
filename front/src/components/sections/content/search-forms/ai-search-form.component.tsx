import React, { useRef } from "react";
import "./ai-search-form.component.css";

interface AISearchFormProps {
  type: "client" | "carrier";
  onAIRequest: (prompt: string) => void;
}

const ENTER_SYMBOL = "↵";

const AISearchForm: React.FC<AISearchFormProps> = ({ type: _type, onAIRequest }) => {
  const editableRef = useRef<HTMLDivElement>(null);

  const ensureSymbolAtEnd = () => {
    if (!editableRef.current) return;

    const content = editableRef.current.innerHTML;

    // Odstráň existujúce symboly ENTER_SYMBOL
    const cleanContent = content
      .replace(new RegExp(`<span class="enter-symbol">${ENTER_SYMBOL}</span>`, "g"), "")
      .trim();

    // Pridaj symbol na koniec
    editableRef.current.innerHTML = `${cleanContent}<span class="enter-symbol">${ENTER_SYMBOL}</span>`;

    // Presun kurzora na koniec textu, pred symbol
    const range = document.createRange();
    const sel = window.getSelection();

    if (editableRef.current.firstChild) {
      const textNode = editableRef.current.firstChild;

      // Ak textový uzol existuje, nastav kurzor na koniec textového obsahu
      if (textNode.nodeType === Node.TEXT_NODE) {
        range.setStart(textNode, textNode.textContent?.length || 0);
      } else {
        // Ak neexistuje textový uzol, nastav kurzor na koniec editovateľného divu
        range.setStart(editableRef.current, editableRef.current.childNodes.length - 1);
      }

      range.collapse(true);
      sel?.removeAllRanges();
      sel?.addRange(range);
    }
  };

  const handleInput = () => {
    ensureSymbolAtEnd();
  };

  const handleSubmit = () => {
    if (!editableRef.current) return;

    const content = editableRef.current.textContent || "";
    const cleanText = content.replace(ENTER_SYMBOL, "").trim();

    if (cleanText.length > 0) {
      onAIRequest(cleanText);
      editableRef.current.innerHTML = `<span class="enter-symbol">${ENTER_SYMBOL}</span>`;
    }
  };

  return (
    <div className={`ai-search-form ${_type === "carrier" ? "carrier" : ""}`}>
      <div className={`ai-search-title ${_type === "carrier" ? "carrier" : ""}`}>
        {_type === "client"
          ? "Need to send something and find the perfect carrier? Ask AI or fill out the form."
          : "Need to find a suitable load for your truck? Ask AI or fill out the relevant form."}
      </div>

      <div
        className="ai-editable"
        contentEditable
        ref={editableRef}
        onInput={handleInput}
        suppressContentEditableWarning
        data-placeholder={
          _type === "client"
            ? "Describe what you need to send"
            : "Describe what kind of load you're looking for"
        }
      >
        <span className="enter-symbol">{ENTER_SYMBOL}</span>
      </div>
      <button onClick={handleSubmit} className="ai-submit-button">
        Ask AI
      </button>
    </div>
  );
};

export default AISearchForm;
