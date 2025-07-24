// File: src/shared/hooks/shared.use-lscroll-llock.hook.ts
import { useEffect } from "react";

let lockCount = 0;

export const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      lockCount++;

      if (lockCount === 1) {
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflow = "hidden";
      }

      return () => {
        lockCount--;

        if (lockCount === 0) {
          document.body.style.paddingRight = "";
          document.body.style.overflow = "";
        }
      };
    }
  }, [isLocked]);
};
