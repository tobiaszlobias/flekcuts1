"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import { CONSENT_STORAGE_KEY, readConsent, writeConsent } from "@/lib/consent";

type Draft = {
  analytics: boolean;
  external: boolean;
};

const ConsentBanner = () => {
  const [mounted, setMounted] = useState(false);
  const [consent, setConsent] = useState(() => readConsent());
  const [showSettings, setShowSettings] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => setMounted(true), []);

  const hasChoice = !!consent;
  const showBanner = !hasChoice && !showSettings && !dismissed;

  const initialDraft: Draft = useMemo(
    () => ({
      analytics: consent?.analytics ?? false,
      external: consent?.external ?? false,
    }),
    [consent?.analytics, consent?.external]
  );

  const [draft, setDraft] = useState<Draft>(initialDraft);

  useEffect(() => {
    setDraft(initialDraft);
  }, [initialDraft]);

  useEffect(() => {
    const onOpen = () => setShowSettings(true);
    const onUpdated = () => setConsent(readConsent());
    const onStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_STORAGE_KEY) setConsent(readConsent());
    };
    const onFocus = () => setConsent(readConsent());
    const onVisibility = () => {
      if (document.visibilityState === "visible") setConsent(readConsent());
    };
    window.addEventListener("flekcuts:openConsentSettings", onOpen as EventListener);
    window.addEventListener("flekcuts:consentUpdated", onUpdated as EventListener);
    window.addEventListener("storage", onStorage);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("flekcuts:openConsentSettings", onOpen as EventListener);
      window.removeEventListener("flekcuts:consentUpdated", onUpdated as EventListener);
      window.removeEventListener("storage", onStorage);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  useEffect(() => {
    // Ensure we pick up stored consent even if the initial render happened before storage was ready.
    setConsent(readConsent());
  }, []);

  const acceptAll = () => {
    setDismissed(true);
    try {
      setConsent(writeConsent({ analytics: true, external: true }));
    } finally {
      setShowSettings(false);
    }
  };

  const rejectAll = () => {
    setDismissed(true);
    try {
      setConsent(writeConsent({ analytics: false, external: false }));
    } finally {
      setShowSettings(false);
    }
  };

  const openSettings = () => setShowSettings(true);
  const closeSettings = () => {
    // If the user closes settings without a stored choice yet, treat it as reject-all.
    if (!consent) {
      setDismissed(true);
      setConsent(writeConsent({ analytics: false, external: false }));
    }
    setShowSettings(false);
  };

  const saveSettings = () => {
    setConsent(writeConsent({ analytics: draft.analytics, external: draft.external }));
    setShowSettings(false);
  };

  useEffect(() => {
    if (!showSettings) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSettings();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [showSettings, consent, draft.analytics, draft.external]);

  if (!mounted) return null;

  return createPortal(
    <>
      {showBanner && (
        <div className="fixed inset-x-0 bottom-0 z-[2147483647] pointer-events-auto border-t border-gray-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
            <div className="text-sm text-gray-700">
              <div className="font-montserrat font-semibold text-gray-900">
                Cookies a soukromí
              </div>
              <div className="font-montserrat text-gray-600">
                Používáme nezbytné cookies. Analytiku a externí obsah (Google Maps)
                spouštíme jen po vašem souhlasu.
              </div>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                onClick={rejectAll}
                variant="outline"
                className="w-full rounded-full border-2 border-gray-300 text-gray-800 hover:bg-white sm:w-auto"
              >
                Odmítnout vše
              </Button>
              <Button
                onClick={openSettings}
                variant="outline"
                className="w-full rounded-full border-2 border-[#FF6B35]/40 text-[#FF6B35] hover:bg-white sm:w-auto"
              >
                Nastavení
              </Button>
              <Button
                onClick={acceptAll}
                className="w-full rounded-full bg-[#FF6B35] text-white hover:bg-[#E5572C] sm:w-auto"
              >
                Přijmout vše
              </Button>
            </div>
          </div>
        </div>
      )}

      {showSettings && (
        <div
          className="fixed inset-0 z-[2147483646] flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          onClick={closeSettings}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-gray-200 px-6 py-4">
              <div className="font-crimson italic text-2xl font-bold text-gray-900">
                Nastavení cookies
              </div>
              <div className="mt-1 font-montserrat text-sm text-gray-600">
                Souhlas můžete kdykoli změnit v patičce webu.
              </div>
            </div>

            <div className="px-6 py-5 space-y-4">
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-montserrat font-semibold text-gray-900">
                      Nezbytné
                    </div>
                    <div className="font-montserrat text-sm text-gray-600">
                      Potřebné pro přihlášení a správné fungování webu.
                    </div>
                  </div>
                  <div className="font-montserrat text-sm font-semibold text-gray-500">
                    Vždy zapnuto
                  </div>
                </div>
              </div>

              <label className="block rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-montserrat font-semibold text-gray-900">
                      Analytika (Vercel)
                    </div>
                    <div className="font-montserrat text-sm text-gray-600">
                      Pomáhá nám zlepšovat web (Vercel Analytics + Speed Insights).
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.analytics}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, analytics: e.target.checked }))
                    }
                    className="mt-1 h-5 w-5 accent-[#FF6B35]"
                  />
                </div>
              </label>

              <label className="block rounded-xl border border-gray-200 bg-white p-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="font-montserrat font-semibold text-gray-900">
                      Externí obsah (Google Maps)
                    </div>
                    <div className="font-montserrat text-sm text-gray-600">
                      Načte mapu od Google a může předávat technické údaje (např. IP).
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={draft.external}
                    onChange={(e) =>
                      setDraft((prev) => ({ ...prev, external: e.target.checked }))
                    }
                    className="mt-1 h-5 w-5 accent-[#FF6B35]"
                  />
                </div>
              </label>
            </div>

            <div className="flex flex-col gap-2 border-t border-gray-200 px-6 py-4 sm:flex-row sm:justify-end">
              <Button
                onClick={rejectAll}
                variant="outline"
                className="rounded-full border-2 border-gray-300 text-gray-800 hover:bg-white"
              >
                Odmítnout vše
              </Button>
              <Button
                onClick={acceptAll}
                variant="outline"
                className="rounded-full border-2 border-[#FF6B35]/40 text-[#FF6B35] hover:bg-white"
              >
                Přijmout vše
              </Button>
              <Button
                onClick={saveSettings}
                className="rounded-full bg-[#FF6B35] text-white hover:bg-[#E5572C]"
              >
                Uložit
              </Button>
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default ConsentBanner;
