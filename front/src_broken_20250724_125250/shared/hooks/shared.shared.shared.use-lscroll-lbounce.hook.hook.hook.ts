// File: shared/hooks/shared.shared.shared.use-scroll-bounce.hook.hook.hook.ts
import { useEffect } from "react";

const useScrollBounce = () => {
  useEffect(() => {
    let isAnimating = false;

    // macOS detection
    const isNonMacOS = () => {
      const platform = navigator.platform.toUpperCase();
      const userAgent = navigator.userAgent.toUpperCase();
      return !platform.includes("MAC") && !userAgent.includes("MAC");
    };

    if (!isNonMacOS()) {
      return;
    }

    // Setting 1px for opening
    window.scrollTo({
      top: 1,
      behavior: "auto",
    });

    const handleScroll = () => {
      const currentScrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (currentScrollTop < 1) {
        window.scrollTo({
          top: 1,
          behavior: "auto",
        });
      }

      if (currentScrollTop <= 1 && !isAnimating) {
        isAnimating = true;

        requestAnimationFrame(() => {
          const content = document.body;
          content.style.transform = "translateY(5px)";
          content.style.transition = "none";

          setTimeout(() => {
            content.style.transform = "translateY(0)";
            content.style.transition =
              "transform 400ms cubic-bezier(0.4, 0, 0.2, 1)";

            setTimeout(() => {
              content.style.transform = "";
              content.style.transition = "";
              isAnimating = false;
            }, 300);
          }, 50);
        });
      }
    };

    const handleWheel = (e: WheelEvent) => {
      const currentScrollTop =
        window.pageYOffset || document.documentElement.scrollTop;

      if (currentScrollTop <= 1 && e.deltaY < 0) {
        window.scrollTo({
          top: 1,
          behavior: "auto",
        });
      }
    };

    // Added event istener
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("wheel", handleWheel, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);
};

export default useScrollBounce;
