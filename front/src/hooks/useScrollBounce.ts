// ./front/src/hooks/useScrollBounce.ts
import { useEffect } from 'react';

const useScrollBounce = () => {
  useEffect(() => {
    let isAnimating = false;

    // Preventívne nastavenie scrollu na 1px pri načítaní
    window.scrollTo({
      top: 1,
      behavior: 'auto'
    });

    const handleScroll = () => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Ak sme príliš blízko k vrchu (menej ako 1px), okamžite posunieme na 1px
      if (currentScrollTop < 1) {
        window.scrollTo({
          top: 1,
          behavior: 'auto'
        });
      }

      // Bounce efekt spustíme, keď sme veľmi blízko vrchu (ale nie na 0px)
      if (currentScrollTop <= 1 && !isAnimating) {
        isAnimating = true;

        requestAnimationFrame(() => {
          const content = document.body;
          content.style.transform = 'translateY(5px)';  // Zmenšený odskok na 5px
          content.style.transition = 'none';
          
          setTimeout(() => {
            content.style.transform = 'translateY(0)';
            content.style.transition = 'transform 400ms cubic-bezier(0.4, 0, 0.2, 1)';
            
            setTimeout(() => {
              content.style.transform = '';
              content.style.transition = '';
              isAnimating = false;
            }, 300);
          }, 50);
        });
      }
    };

    // Pridáme aj wheel event pre ešte rýchlejšiu reakciu
    const handleWheel = (e: WheelEvent) => {
      const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
      if (currentScrollTop <= 1 && e.deltaY < 0) {
        window.scrollTo({
          top: 1,
          behavior: 'auto'
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);
};

export default useScrollBounce;