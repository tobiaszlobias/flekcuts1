"use client";

import { useEffect, useRef } from "react";

const CLERK_MODAL_BACKDROP_SELECTOR = ".cl-modalBackdrop";

function isClerkModalOpen(): boolean {
  return Boolean(document.querySelector(CLERK_MODAL_BACKDROP_SELECTOR));
}

export default function ClerkModalScrollLock() {
  const isLockedRef = useRef(false);
  const scrollYRef = useRef(0);

  useEffect(() => {
    const lock = () => {
      if (isLockedRef.current) return;
      isLockedRef.current = true;

      scrollYRef.current = window.scrollY;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.classList.add("clerk-modal-open");
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollYRef.current}px`;
      document.body.style.left = "0";
      document.body.style.right = "0";
      document.body.style.width = "100%";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }
    };

    const unlock = () => {
      if (!isLockedRef.current) return;
      isLockedRef.current = false;

      document.body.classList.remove("clerk-modal-open");
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.left = "";
      document.body.style.right = "";
      document.body.style.width = "";
      document.body.style.paddingRight = "";

      // Ensure restoring scroll position is instant (site enables smooth scrolling globally).
      const prevHtmlScrollBehavior = document.documentElement.style.scrollBehavior;
      const prevBodyScrollBehavior = document.body.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      document.body.style.scrollBehavior = "auto";
      window.scrollTo({ top: scrollYRef.current, left: 0, behavior: "auto" });
      document.documentElement.style.scrollBehavior = prevHtmlScrollBehavior;
      document.body.style.scrollBehavior = prevBodyScrollBehavior;
    };

    const update = () => {
      if (isClerkModalOpen()) lock();
      else unlock();
    };

    update();
    const observer = new MutationObserver(update);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      observer.disconnect();
      unlock();
    };
  }, []);

  return null;
}
