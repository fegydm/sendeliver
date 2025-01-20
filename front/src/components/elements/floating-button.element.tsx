// ./front/src/components/elements/floating-button.element.tsx
import React, { useState, useEffect } from "react";
import { FaArrowUp } from "react-icons/fa";

const FloatingButton: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      className="footer__floating"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
    >
      <FaArrowUp size={24} />
    </button>
  );
};

export default FloatingButton;
