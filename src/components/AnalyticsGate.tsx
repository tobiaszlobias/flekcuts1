"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { readConsent } from "@/lib/consent";

const AnalyticsGateInner = dynamic(() => import("./AnalyticsGateInner"), {
  ssr: false,
});

const AnalyticsGate = () => {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const consent = readConsent();
    setEnabled(!!consent?.analytics);

    const onUpdated = () => {
      const next = readConsent();
      setEnabled(!!next?.analytics);
    };
    window.addEventListener("flekcuts:consentUpdated", onUpdated as EventListener);
    return () => {
      window.removeEventListener(
        "flekcuts:consentUpdated",
        onUpdated as EventListener
      );
    };
  }, []);

  if (!enabled) return null;
  return <AnalyticsGateInner />;
};

export default AnalyticsGate;
