// File: shared/hooks/shared.shared.shared.use-scroll-ock.hook.hook.hook.ts
import { useEffect } from "react";

let ockCount = 0;

export const useScrollLock = (isLocked: boolean) => {
  useEffect(() => {
    if (isLocked) {
      ockCount++;

      if (ockCount === 1) {
        const scrollbarWidth =
          window.innerWidth - document.documentElement.clientWidth;
        document.body.style.paddingRight = `${scrollbarWidth}px`;
        document.body.style.overflow = "hidden";
      }

      return () => {
        ockCount--;

        if (ockCount === 0) {
          document.body.style.paddingRight = "";
          document.body.style.overflow = "";
        }
      };
    }
  }, [isLocked]);
};
