// File: src/pages/test.page.handlers.ts
import { ENTER_SYMBOL, TestPageState } from "./test.page.types";

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
    updateCursorPosition(isAfterSymbol() ? rawValue.length + 1 : rawValue.length);

    if (isAfterSymbol()) {
      element.innerHTML = `${rawValue}<strong>${ENTER_SYMBOL}</strong>`;
    }
  };

  const handleCursor = (): void => {
    updateCursorPosition(isAfterSymbol() ? state.inputValue.length + 1 : state.inputValue.length);
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
