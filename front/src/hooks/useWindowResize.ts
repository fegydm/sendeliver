import { useEffect } from 'react';

const useWindowResize = (callback: () => void) => {
  useEffect(() => {
    let resizeTimeout: ReturnType<typeof setTimeout> | null = null;

    const handleResize = () => {
      if (resizeTimeout) {
        clearTimeout(resizeTimeout);
      }

      resizeTimeout = setTimeout(() => {
        callback();
      }, 100);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [callback]);
};

export default useWindowResize;