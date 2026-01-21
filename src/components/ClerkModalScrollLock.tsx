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
  const removeBackdropGuardsRef = useRef<null | (() => void)>(null);
  const openAnimRafRef = useRef<number | null>(null);

  useEffect(() => {
    let rafId: number | null = null;

    const lock = () => {
      if (isLockedRef.current) return;
      isLockedRef.current = true;

      scrollYRef.current = window.scrollY;
      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.classList.add("clerk-modal-open");
      document.body.classList.remove("clerk-modal-opened");
      document.body.classList.add("clerk-modal-opening");
      document.documentElement.style.overflow = "hidden";
      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      if (openAnimRafRef.current != null) {
        cancelAnimationFrame(openAnimRafRef.current);
      }
      openAnimRafRef.current = requestAnimationFrame(() => {
        document.body.classList.add("clerk-modal-opened");
        document.body.classList.remove("clerk-modal-opening");
        openAnimRafRef.current = null;
      });

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

      const preventBackdropClose = (e: Event) => {
        const target = e.target;
        if (!(target instanceof Element)) return;
        const inBackdrop = Boolean(target.closest(CLERK_MODAL_BACKDROP_SELECTOR));
        const inModal = Boolean(target.closest(CLERK_MODAL_ALLOW_SELECTOR));
        if (inBackdrop && !inModal) {
          e.preventDefault();
          e.stopPropagation();
          // @ts-expect-error stopImmediatePropagation exists on Event in browsers
          e.stopImmediatePropagation?.();
        }
      };
      // Use window-level capture so we run before any document-level handlers Clerk attaches.
      window.addEventListener("pointerdown", preventBackdropClose, true);
      window.addEventListener("pointerup", preventBackdropClose, true);
      window.addEventListener("click", preventBackdropClose, true);
      window.addEventListener("mousedown", preventBackdropClose, true);
      window.addEventListener("mouseup", preventBackdropClose, true);
      window.addEventListener("touchstart", preventBackdropClose, true);
      window.addEventListener("touchend", preventBackdropClose, true);
      removeBackdropGuardsRef.current = () => {
        window.removeEventListener("pointerdown", preventBackdropClose, true);
        window.removeEventListener("pointerup", preventBackdropClose, true);
        window.removeEventListener("click", preventBackdropClose, true);
        window.removeEventListener("mousedown", preventBackdropClose, true);
        window.removeEventListener("mouseup", preventBackdropClose, true);
        window.removeEventListener("touchstart", preventBackdropClose, true);
        window.removeEventListener("touchend", preventBackdropClose, true);
      };
    };

    const unlock = () => {
      if (!isLockedRef.current) return;
      isLockedRef.current = false;

      document.body.classList.remove("clerk-modal-open");
      document.body.classList.remove("clerk-modal-opening");
      document.body.classList.remove("clerk-modal-opened");
      document.body.style.paddingRight = "";
      document.documentElement.style.overflow = "";
      removeGuardsRef.current?.();
      removeGuardsRef.current = null;
      removeBackdropGuardsRef.current?.();
      removeBackdropGuardsRef.current = null;
      if (openAnimRafRef.current != null) {
        cancelAnimationFrame(openAnimRafRef.current);
        openAnimRafRef.current = null;
      }

      // Ensure restoring scroll position is instant (site enables smooth scrolling globally).
      const prevHtmlScrollBehavior = document.documentElement.style.scrollBehavior;
      const prevBodyScrollBehavior = document.body.style.scrollBehavior;
      document.documentElement.style.scrollBehavior = "auto";
      document.body.style.scrollBehavior = "auto";
      window.scrollTo({ top: scrollYRef.current, left: 0, behavior: "auto" });
      document.documentElement.style.scrollBehavior = prevHtmlScrollBehavior;
      document.body.style.scrollBehavior = prevBodyScrollBehavior;
    };

    const scheduleUpdate = () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        rafId = null;
        if (isClerkModalOpen()) lock();
        else unlock();
      });
    };

    scheduleUpdate();
    const observer = new MutationObserver(scheduleUpdate);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      if (rafId != null) cancelAnimationFrame(rafId);
      observer.disconnect();
      unlock();
    };
  }, []);

  return null;
}
