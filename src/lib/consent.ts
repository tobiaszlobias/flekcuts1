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
const COOKIE_KEY = "flekcuts-consent-v1";

const isBrowser = () => typeof window !== "undefined";

let memoryConsent: ConsentState | null = null;

const readCookie = (name: string): string | null => {
  if (!isBrowser()) return null;
  const parts = window.document.cookie ? window.document.cookie.split("; ") : [];
  for (const part of parts) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    const key = part.slice(0, eq);
    if (key !== name) continue;
    return part.slice(eq + 1);
  }
  return null;
};

const writeCookie = (name: string, value: string) => {
  if (!isBrowser()) return;
  const maxAgeSeconds = 180 * 24 * 60 * 60; // 180 days
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  window.document.cookie = `${name}=${value}; Max-Age=${maxAgeSeconds}; Path=/; SameSite=Lax${secure}`;
};

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
    // If localStorage is blocked/unavailable, try cookie fallback.
    if (memoryConsent) return memoryConsent;
    try {
      const cookieRaw = readCookie(COOKIE_KEY);
      if (!cookieRaw) return null;
      const decoded = decodeURIComponent(cookieRaw);
      const parsed = JSON.parse(decoded) as Partial<ConsentState>;
      if (parsed.version !== 1) return null;
      if (typeof parsed.analytics !== "boolean") return null;
      if (typeof parsed.external !== "boolean") return null;
      if (typeof parsed.updatedAt !== "string") return null;
      const normalized = parsed as ConsentState;
      memoryConsent = normalized;
      return normalized;
    } catch {
      return null;
    }
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
  try {
    writeCookie(COOKIE_KEY, encodeURIComponent(JSON.stringify(next)));
  } catch {
    // Ignore cookie write failures.
  }
  window.dispatchEvent(new CustomEvent("flekcuts:consentUpdated", { detail: next }));
  return next;
};

export const openConsentSettings = () => {
  if (!isBrowser()) return;
  window.dispatchEvent(new CustomEvent("flekcuts:openConsentSettings"));
};

export const CONSENT_STORAGE_KEY = STORAGE_KEY;
