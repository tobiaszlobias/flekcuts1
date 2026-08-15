const STORAGE_KEY = "flekcuts_reregistration_notice_dismissed_v1";

export const isReregistrationNoticeDismissed = () => {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
};

export const dismissReregistrationNotice = () => {
  try {
    window.localStorage.setItem(STORAGE_KEY, "1");
  } catch {
    // ignore storage errors (e.g. private mode)
  }
};
