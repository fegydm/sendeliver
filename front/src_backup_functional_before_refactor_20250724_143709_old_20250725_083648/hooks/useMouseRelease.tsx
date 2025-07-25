// ./front/src/hooks/useMouseRelease.tsx

import { useEffect } from 'react';

const useMouseRelease = () => {
  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      // Simulujeme uvoľnenie tlačidla myši po 100 ms
      setTimeout(() => {
        // Simulujeme uvoľnenie tlačidla myši
        const mouseUpEvent = new MouseEvent("mouseup", { bubbles: true });
        document.dispatchEvent(mouseUpEvent);

        // Zrušíme focus z aktuálneho aktívneho elementu (ak nejaký je)
        const activeElement = document.activeElement;
        
        // Skontrolujeme, či aktívny element podporuje metódu blur
        if (activeElement instanceof HTMLElement) {
          activeElement.blur(); // Zrušíme focus na aktívnom elemente
        }
      }, 100);
    };

    // Pridáme poslucháč pre "mousedown" na celú stránku
    document.addEventListener('mousedown', handleMouseDown);

    // Čistíme poslucháča pri odchode z komponentu
    return () => {
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  return null;
};

export default useMouseRelease;
