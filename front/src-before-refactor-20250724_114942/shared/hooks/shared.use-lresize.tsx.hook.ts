// File: src/shared/hooks/shared.use-lresize.tsx.hook.ts

import { useState, useEffect } from 'react';

export const useResize = () => {
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      // Uvoľníme a opätovne stlačíme tlačidlo myši počas zmeny veľkosti okna
      const mouseUpEvent = new MouseEvent("mouseup", { bubbles: true });
      const mouseDownEvent = new MouseEvent("mousedown", { bubbles: true });

      document.dispatchEvent(mouseUpEvent);  // Uvoľnenie tlačidla myši
      document.dispatchEvent(mouseDownEvent);  // Opätovné stlačenie tlačidla myši

      // Simulácia núteného reflow: Môžeme zmeniť niečo na DOM elemente, aby to prinútilo prehliadač vykresliť
      const dummyElement = document.createElement('div');
      dummyElement.style.height = '0px'; // Zmena štýlu, ktorá spôsobí reflow
      document.body.appendChild(dummyElement);

      // Ihneď odstránime tento element po vykonaní reflow
      setTimeout(() => {
        document.body.removeChild(dummyElement);
      }, 0);

      // Nastavenie novej veľkosti okna
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return windowSize;
};
