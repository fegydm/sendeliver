import { useState } from "react";

interface UseSmartInputProps {
  initialText?: string;
  onSubmit?: (text: string) => void;
}

export const useSmartInput = ({
  initialText = "",
  onSubmit,
}: UseSmartInputProps) => {
  const [text, setText] = useState(initialText + " ↵");
  const [isSymbolActive, setIsSymbolActive] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const cursorPosition = (e.target as HTMLTextAreaElement).selectionStart;

    if (isSymbolActive && e.key === "Enter") {
      e.preventDefault();
      if (onSubmit) {
        onSubmit(text.replace("↵", "").trim());
      }
      setText(initialText + " ↵");
    } else if (e.key === "Enter") {
      setText((prev) => prev + "\n");
      e.preventDefault();
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setIsSymbolActive(false);
  };

  const handleCursorMove = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const cursorPosition = e.target.selectionStart;
    setIsSymbolActive(cursorPosition === text.length - 1);
  };

  return {
    text,
    setText,
    handleKeyDown,
    handleChange,
    handleCursorMove,
    isSymbolActive,
  };
};
