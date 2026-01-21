import { useEffect } from "react";

let lockCount = 0;
let savedBodyStyle = "";
let savedHtmlStyle = "";
let removeGuards: (() => void) | null = null;

export const useBodyScrollLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;

    lockCount += 1;
    if (lockCount !== 1) {
      return () => {
        lockCount = Math.max(0, lockCount - 1);
      };
    }

    savedBodyStyle = document.body.getAttribute("style") || "";
    savedHtmlStyle = document.documentElement.getAttribute("style") || "";

    // Keep the page in-place without breaking `position: sticky` headers:
    // lock scrolling via overflow + input guards (touchmove/wheel).
    document.documentElement.style.overflow = "hidden";
    document.documentElement.style.overscrollBehavior = "none";
    document.body.style.overflow = "hidden";
    document.body.style.overscrollBehavior = "none";
    document.body.style.touchAction = "none";

    const prevent = (e: Event) => e.preventDefault();
    const preventKeys = (e: KeyboardEvent) => {
      // Prevent scroll keys while locked
      const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
      if (keys.includes(e.key)) e.preventDefault();
    };
    document.addEventListener("touchmove", prevent, { passive: false });
    document.addEventListener("wheel", prevent, { passive: false });
    window.addEventListener("keydown", preventKeys);
    removeGuards = () => {
      document.removeEventListener("touchmove", prevent as EventListener);
      document.removeEventListener("wheel", prevent as EventListener);
      window.removeEventListener("keydown", preventKeys);
    };

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount !== 0) return;

      document.body.setAttribute("style", savedBodyStyle);
      document.documentElement.setAttribute("style", savedHtmlStyle);
      removeGuards?.();
      removeGuards = null;
    };
  }, [locked]);
};
