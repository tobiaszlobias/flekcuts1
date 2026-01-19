"use client";

export type ConsentCategories = {
  analytics: boolean;
  external: boolean;
};

export type ConsentState = ConsentCategories & {
  version: 1;
  updatedAt: string; // ISO
};

const STORAGE_KEY = "flekcuts-consent-v1";

const isBrowser = () => typeof window !== "undefined";

export const readConsent = (): ConsentState | null => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.version !== 1) return null;
    if (typeof parsed.analytics !== "boolean") return null;
    if (typeof parsed.external !== "boolean") return null;
    if (typeof parsed.updatedAt !== "string") return null;
    return parsed as ConsentState;
  } catch {
    return null;
  }
};

export const writeConsent = (categories: ConsentCategories): ConsentState => {
  const next: ConsentState = {
    version: 1,
    analytics: !!categories.analytics,
    external: !!categories.external,
    updatedAt: new Date().toISOString(),
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new CustomEvent("flekcuts:consentUpdated", { detail: next }));
  return next;
};

export const openConsentSettings = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent("flekcuts:openConsentSettings"));
};

export const CONSENT_STORAGE_KEY = STORAGE_KEY;

