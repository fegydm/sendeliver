import React, { useState, useRef, useEffect, useCallback, memo } from 'react';

interface EditorProps {}

const TestPage: React.FC<EditorProps> = memo(() => {
  const [placeholder, setPlaceholder] = useState<string>("Click to start typing...");
  const [inputValue, setInputValue] = useState<string>("");
  const [cursorPosition, setCursorPosition] = useState<number | undefined>(undefined);
  const editableRef = useRef<HTMLDivElement | null>(null);
  const ENTER_SYMBOL = "↵";

  const handleFocus = useCallback((): void => setPlaceholder(""), []);

  const handleBlur = useCallback((): void => {
    if (inputValue === "") setPlaceholder("Click to start typing...");
  }, [inputValue]);

  const isCursorRightOfSymbol = useCallback((): boolean => {
    if (cursorPosition === undefined) return false;

    const element = editableRef.current;
    if (!element) return false;

    const lastChild = element.lastChild;
    if (!lastChild) return false;

    if (lastChild.nodeType === Node.TEXT_NODE) {
      return cursorPosition === lastChild.textContent?.length;
    } else if (lastChild.nodeType === Node.ELEMENT_NODE && (lastChild as HTMLElement).contentEditable === 'false') {
      const contentBeforeSymbol = inputValue;
      return cursorPosition > contentBeforeSymbol.length;
    }

    return false;
  }, [cursorPosition, inputValue]);

  const handleInput = useCallback((event: React.FormEvent<HTMLDivElement>): void => {
    const element = event.currentTarget;
    const content = element.innerText;

    if (!content.endsWith(ENTER_SYMBOL)) {
      const symbolIndex = content.lastIndexOf(ENTER_SYMBOL);
      if (symbolIndex !== -1) {
        element.innerText = content.substring(0, symbolIndex) + content.substring(symbolIndex + ENTER_SYMBOL.length);
      }
    }

    let rawValue = content.replace(ENTER_SYMBOL, '');
    setInputValue(rawValue);

    const selection = window.getSelection();
    if (selection) {
      const cursorPos = selection.anchorOffset;
      setCursorPosition(cursorPos);
    }
  }, [ENTER_SYMBOL]);

  const handleCursor = useCallback((): void => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const preSelectionRange = range.cloneRange();

      if (editableRef.current) {
        preSelectionRange.selectNodeContents(editableRef.current);
      }

      preSelectionRange.setEnd(range.startContainer, range.startOffset);
      const start = preSelectionRange.toString().length;
      setCursorPosition(start);
    }
  }, []);

  const sendText = useCallback((text: string): void => {
    console.log('Sending text:', text);
    setInputValue('');
    setCursorPosition(0);
  }, []);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Enter') {
      event.preventDefault();

      if (isCursorRightOfSymbol()) {
        sendText(inputValue);
        return;
      }

      const beforeCursor = inputValue.slice(0, cursorPosition ?? 0);
      const afterCursor = inputValue.slice(cursorPosition ?? 0);

      const newValue = beforeCursor + '\n' + afterCursor;
      setInputValue(newValue);

      setTimeout(() => {
        const newLineStart = beforeCursor.length + 1;
        editableRef.current?.focus();
        setCursorPosition(newLineStart);
      }, 0);

    } else if ((event.key === 'Backspace' || event.key === 'Delete') && isCursorRightOfSymbol()) {
      event.preventDefault();
    }
  }, [inputValue, cursorPosition, isCursorRightOfSymbol, sendText]);

  const handleFirstClick = useCallback((event: React.MouseEvent<HTMLDivElement>): void => {
    const element = event.currentTarget;
    if (element.innerText === placeholder) {
      element.innerText = "";
      setInputValue("");
      setCursorPosition(0);
    }
    handleCursor();
  }, [placeholder, handleCursor]);

  useEffect(() => {
    if (!editableRef.current) return;

    if (inputValue === "") {
      editableRef.current.innerHTML = `<span style="color: #aaa;">${placeholder}</span>`;
      return;
    }

    const symbolStyle = isCursorRightOfSymbol()
      ? 'font-weight: bold; color: black;'
      : 'color: lightgray;';

    editableRef.current.innerHTML = inputValue.replace(/\n/g, '<br/>') +
      `<span style="${symbolStyle}" contenteditable="false">${ENTER_SYMBOL}</span>`;

    const selection = window.getSelection();
    if (!selection || cursorPosition === undefined) return;

    const range = document.createRange();

    if (isCursorRightOfSymbol()) {
      range.setStartAfter(editableRef.current.lastChild!);
      range.setEndAfter(editableRef.current.lastChild!);
    } else {
      const content = inputValue + ENTER_SYMBOL;
      const nodes = Array.from(editableRef.current.childNodes);
      let currentPos = 0;

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        if (node.nodeType === Node.TEXT_NODE) {
          const length = node.textContent?.length || 0;
          if (currentPos + length >= cursorPosition) {
            range.setStart(node, cursorPosition - currentPos);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            return;
          }
          currentPos += length;
        } else if (node.nodeName === 'BR') {
          currentPos += 1;
          if (currentPos === cursorPosition) {
            range.setStart(node, 0);
            range.collapse(true);
            selection.removeAllRanges();
            selection.addRange(range);
            return;
          }
        }
      }
    }

    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    editableRef.current.focus();
  }, [inputValue, cursorPosition, placeholder, isCursorRightOfSymbol, ENTER_SYMBOL]);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <div
        ref={editableRef}
        contentEditable
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onClick={handleFirstClick}
        onKeyUp={handleCursor}
        onKeyDown={handleKeyDown}
        style={{
          width: "100%",
          height: "150px",
          padding: "10px",
          fontSize: "16px",
          border: "1px solid #ccc",
          borderRadius: "4px",
          boxSizing: "border-box",
          resize: "none",
          color: "gray",
          whiteSpace: "pre-wrap",
          outline: "none",
          position: "relative",
        }}
      />
      <style>
        {`
          [contenteditable]:empty::before {
            content: attr(data-placeholder);
            color: #aaa;
            pointer-events: none;
          }
        `}
      </style>
      <div style={{ marginTop: "10px", fontSize: "14px", color: "#333" }}>
        <strong>Console Output:</strong>
        <div style={{ whiteSpace: 'pre-wrap' }}>
          {inputValue}
          <span
            style={{
              fontWeight: isCursorRightOfSymbol() ? "bold" : "normal",
              color: isCursorRightOfSymbol() ? "black" : "lightgray",
            }}
          >
            {ENTER_SYMBOL}
          </span>
        </div>
        <p>Cursor Position: {cursorPosition ?? 'undefined'}</p>
        <p>Cursor Right of Symbol: {isCursorRightOfSymbol() ? "Yes" : "No"}</p>
      </div>
    </div>
  );
});

export default TestPage;