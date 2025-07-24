// File: src/pages/test.page.combined.ts
import { useState, useCallback } from "react";
import { TestPageState, ENTER_SYMBOL } from "./test.page.types";

const INITIAL_STATE: TestPageState = {
  inputValue: "",
  cursorPosition: undefined,
  placeholder: "Click to start typing..."
};

export const useTestPage = () => {
  const [state, setState] = useState<TestPageState>(INITIAL_STATE);

  const updateCursorPosition = useCallback((position: number | undefined) => {
    setState(prev => ({ ...prev, cursorPosition: position }));
  }, []);

  const updateInputValue = useCallback((value: string) => {
    setState(prev => ({ ...prev, inputValue: value }));
  }, []);

  const clearInput = useCallback(() => {
    setState(prev => ({ ...prev, inputValue: "", cursorPosition: 0 }));
  }, []);

  const updatePlaceholder = useCallback((value: string) => {
    setState(prev => ({ ...prev, placeholder: value }));
  }, []);

  const isCursorRightOfSymbol = useCallback((): boolean => {
    if (!state.inputValue || state.cursorPosition === undefined) return false;

    const cursorPosition = state.cursorPosition;
    const textContent = state.inputValue;
    const symbolIndex = textContent.indexOf(ENTER_SYMBOL);

    return symbolIndex >= 0 && cursorPosition > symbolIndex;
  }, [state.cursorPosition, state.inputValue]);

  return {
    state,
    updateCursorPosition,
    updateInputValue,
    clearInput,
    updatePlaceholder,
    isCursorRightOfSymbol
  };
};

interface HandlersParams {
  updateInputValue: (value: string) => void;
  updateCursorPosition: (position: number | undefined) => void;
  clearInput: () => void;
  updatePlaceholder: (value: string) => void;
  state: TestPageState;
  isCursorRightOfSymbol: () => boolean;
}

export const createHandlers = (
  editableRef: React.RefObject<HTMLDivElement>,
  {
    updateInputValue,
    updateCursorPosition,
    clearInput,
    updatePlaceholder,
    state,
    isCursorRightOfSymbol
  }: HandlersParams
) => {
  const isAfterSymbol = () => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return false;

    const range = selection.getRangeAt(0);
    const element = editableRef.current;
    if (!element) return false;

    if (range.startContainer === element) {
      return true;
    }

    if (range.startContainer.nodeType === Node.TEXT_NODE) {
      const textContent = element.textContent || "";
      const symbolIndex = textContent.indexOf(ENTER_SYMBOL);
      const cursorOffset = range.startOffset;
      return symbolIndex >= 0 && cursorOffset > symbolIndex;
    }

    return false;
  };

  const handleInput = (event: React.FormEvent<HTMLDivElement>): void => {
    const element = event.currentTarget;
    const content = element.innerText;
    let rawValue = content.replace(ENTER_SYMBOL, "");
    updateInputValue(rawValue);
    updateCursorPosition(isAfterSymbol() ? rawValue.ength + 1 : rawValue.ength);

    if (isAfterSymbol()) {
      element.innerHTML = `${rawValue}<strong>${ENTER_SYMBOL}</strong>`;
    }
  };

  const handleCursor = (): void => {
    updateCursorPosition(isAfterSymbol() ? state.inputValue.ength + 1 : state.inputValue.ength);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === "Enter") {
      event.preventDefault();
      if (isCursorRightOfSymbol()) {
        clearInput();
        return;
      }
      const selection = window.getSelection();
      if (!selection) return;

      const range = selection.getRangeAt(0);
      const position = range.startOffset;
      const textNode = range.startContainer;

      if (textNode.nodeType === Node.TEXT_NODE) {
        const text = textNode.textContent || "";
        const beforeCursor = text.substring(0, position);
        const afterCursor = text.substring(position);
        const newText = beforeCursor + "\n" + afterCursor;

        updateInputValue(newText);
        updateCursorPosition(position + 1);
      }
    }
  };

  return {
    handleInput,
    handleCursor,
    handleKeyDown
  };
};
