"use client";

import { useEffect, useRef } from "react";

const CLERK_MODAL_BACKDROP_SELECTOR = ".cl-modalBackdrop";
const CLERK_MODAL_ALLOW_SELECTOR =
  '.cl-modal, .cl-card, .cl-modalContent, [data-scroll-lock-allow="true"]';

function isClerkModalOpen(): boolean {
  return Boolean(document.querySelector(CLERK_MODAL_BACKDROP_SELECTOR));
}

export default function ClerkModalScrollLock() {
  const isLockedRef = useRef(false);
  const scrollYRef = useRef(0);
  const removeGuardsRef = useRef<null | (() => void)>(null);

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

      const allowScroll = (target: EventTarget | null) => {
        if (!(target instanceof Element)) return false;
        return Boolean(target.closest(CLERK_MODAL_ALLOW_SELECTOR));
      };

      const preventOutside = (e: Event) => {
        if (allowScroll(e.target)) return;
        e.preventDefault();
      };

      const preventKeys = (e: KeyboardEvent) => {
        const keys = ["ArrowUp", "ArrowDown", "PageUp", "PageDown", "Home", "End", " "];
        if (keys.includes(e.key)) e.preventDefault();
      };

      document.addEventListener("touchmove", preventOutside, { passive: false });
      document.addEventListener("wheel", preventOutside, { passive: false });
      window.addEventListener("keydown", preventKeys);
      const removeGuards = () => {
        document.removeEventListener("touchmove", preventOutside as EventListener);
        document.removeEventListener("wheel", preventOutside as EventListener);
        window.removeEventListener("keydown", preventKeys);
      };
      removeGuardsRef.current = removeGuards;
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
      removeGuardsRef.current?.();
      removeGuardsRef.current = null;

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
