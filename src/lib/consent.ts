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

let memoryConsent: ConsentState | null = null;

export const readConsent = (): ConsentState | null => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return memoryConsent;
    const parsed = JSON.parse(raw) as Partial<ConsentState>;
    if (parsed.version !== 1) return null;
    if (typeof parsed.analytics !== "boolean") return null;
    if (typeof parsed.external !== "boolean") return null;
    if (typeof parsed.updatedAt !== "string") return null;
    const normalized = parsed as ConsentState;
    memoryConsent = normalized;
    return normalized;
  } catch {
    return memoryConsent;
  }
};

export const writeConsent = (categories: ConsentCategories): ConsentState => {
  const next: ConsentState = {
    version: 1,
    analytics: !!categories.analytics,
    external: !!categories.external,
    updatedAt: new Date().toISOString(),
  };
  memoryConsent = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // If storage is unavailable (blocked/quota), still allow dismissing the banner for this session.
  }
  window.dispatchEvent(new CustomEvent("flekcuts:consentUpdated", { detail: next }));
  return next;
};

export const openConsentSettings = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent("flekcuts:openConsentSettings"));
};

export const CONSENT_STORAGE_KEY = STORAGE_KEY;
