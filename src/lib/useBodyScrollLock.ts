import { useEffect } from "react";

let lockCount = 0;
let savedScrollY = 0;
let savedBodyStyle = "";
let savedHtmlOverflow = "";

export const useBodyScrollLock = (locked: boolean) => {
  useEffect(() => {
    if (!locked) return;

    lockCount += 1;
    if (lockCount !== 1) {
      return () => {
        lockCount = Math.max(0, lockCount - 1);
      };
    }

    savedScrollY = window.scrollY || 0;
    savedBodyStyle = document.body.getAttribute("style") || "";
    savedHtmlOverflow = document.documentElement.style.overflow || "";

    document.documentElement.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${savedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
    document.body.style.overflow = "hidden";

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount !== 0) return;

      document.body.setAttribute("style", savedBodyStyle);
      document.documentElement.style.overflow = savedHtmlOverflow;
      window.scrollTo(0, savedScrollY);
    };
  }, [locked]);
};

