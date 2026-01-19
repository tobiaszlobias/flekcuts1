"use client";

import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const AnalyticsGateInner = () => {
  return (
    <>
      <SpeedInsights />
      <Analytics />
    </>
  );
};

export default AnalyticsGateInner;

