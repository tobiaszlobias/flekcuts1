"use client";

const ANNOUNCEMENT_START = new Date("2026-03-10T00:00:00+01:00");
const ANNOUNCEMENT_END = new Date("2026-05-30T00:00:00+02:00");

export const isAnnouncementActive = () => {
  const now = new Date();
  return now >= ANNOUNCEMENT_START && now < ANNOUNCEMENT_END;
};

const AnnouncementBanner = () => {
  if (!isAnnouncementActive()) return null;

  return (
    <section className="relative overflow-hidden border-b border-[#FF6B35]/35 bg-[linear-gradient(135deg,#FFE2D2_0%,#FFF0E7_42%,#FFFFFF_100%)]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,107,53,0.28),_transparent_35%),radial-gradient(circle_at_bottom_right,_rgba(255,107,53,0.10),_transparent_28%)]" />
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-5">
        <div className="relative rounded-2xl border border-[#FF6B35]/35 bg-[linear-gradient(135deg,rgba(255,255,255,0.96)_0%,rgba(255,244,238,0.98)_100%)] px-5 py-4 shadow-[0_18px_44px_rgba(255,107,53,0.18)] backdrop-blur-sm sm:px-6">
          <p className="font-montserrat text-sm font-semibold leading-relaxed text-gray-900 sm:text-base">
            Od 1. května 2026 platí nová nabídka služeb, ceny a otevírací doba.
          </p>
        </div>
      </div>
    </section>
  );
};

export default AnnouncementBanner;
