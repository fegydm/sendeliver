// ./front/src/hooks/useScrollBounce.ts
import { useEffect } from 'react';

const useScrollBounce = () => {
  useEffect(() => {
    let lastScrollTop = 0;
    let isAtTop = true;

    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

      // Kontrola či sme na vrchu
      if (scrollTop === 0 && !isAtTop) {
        isAtTop = true;
        // Jednoduché posunutie dole a späť
        window.requestAnimationFrame(() => {
          document.body.style.transform = 'translateY(20px)';
          setTimeout(() => {
            document.body.style.transform = 'translateY(0)';
            document.body.style.transition = 'transform 0.2s ease-out';
          }, 50);
        });
      } else if (scrollTop > 0) {
        isAtTop = false;
        document.body.style.transition = '';
        document.body.style.transform = '';
      }

      lastScrollTop = scrollTop;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
};

export default useScrollBounce;