// File: src/pages/test.page.hook.ts
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
