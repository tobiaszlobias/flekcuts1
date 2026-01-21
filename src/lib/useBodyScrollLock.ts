import { useLayoutEffect } from "react";

let lockCount = 0;
let savedBodyStyle = "";
let savedHtmlStyle = "";
let savedScrollY = 0;
let removeGuards: (() => void) | null = null;

export const useBodyScrollLock = (locked: boolean) => {
  useLayoutEffect(() => {
    if (!locked) return;

    lockCount += 1;
    if (lockCount !== 1) {
      return () => {
        lockCount = Math.max(0, lockCount - 1);
      };
    }

    savedBodyStyle = document.body.getAttribute("style") || "";
    savedHtmlStyle = document.documentElement.getAttribute("style") || "";

    // Lock background scroll (mobile-friendly) without breaking `position: sticky`.
    // Using `position: fixed` avoids iOS/Safari sticky bugs when toggling overflow.
    savedScrollY = window.scrollY;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;

    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    document.documentElement.style.overscrollBehavior = "none";
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount !== 0) return;

      document.body.setAttribute("style", savedBodyStyle);
      document.documentElement.setAttribute("style", savedHtmlStyle);
      removeGuards?.();
      removeGuards = null;

      // Ensure restoring scroll position is instant (site enables smooth scrolling globally).
      const prevHtmlScrollBehavior = document.documentElement.style.scrollBehavior;
      const prevBodyScrollBehavior = document.body.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      document.body.style.scrollBehavior = "auto";
      window.scrollTo({ top: savedScrollY, left: 0, behavior: "auto" });
      document.documentElement.style.scrollBehavior = prevHtmlScrollBehavior;
      document.body.style.scrollBehavior = prevBodyScrollBehavior;
    };
  }, [locked]);
};
