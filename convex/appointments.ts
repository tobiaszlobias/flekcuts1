import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

/* =========================
   HELPERS
========================= */

const parseTimeToMinutes = (time: string): number => {
  const [h, m = "0"] = time.split(":");
  const hh = Number(h);
  const mm = Number(m);
  if (!Number.isFinite(hh) || !Number.isFinite(mm)) return NaN;
  return hh * 60 + mm;
};

const pragueLocalToUtcMs = (date: string, time: string): number => {
  const [yStr, moStr, dStr] = date.split("-");
  const [hhStr, mmStr = "0"] = time.split(":");

  const y = Number(yStr);
  const mo = Number(moStr);
  const d = Number(dStr);
  const h = Number(hhStr);
  const mi = Number(mmStr);

  if (![y, mo, d, h, mi].every(Number.isFinite)) {
    return NaN;
  }

  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  let utcMs = Date.UTC(y, mo - 1, d, h, mi);
  const desiredMinutes = utcMs / 60000;

  for (let i = 0; i < 3; i++) {
    const parts = fmt.formatToParts(new Date(utcMs));
    const get = (type: string) =>
      Number(parts.find((p) => p.type === type)?.value);

    const yy = get("year");
    const mm = get("month");
    const dd = get("day");
    const hh = get("hour");
    const mi2 = get("minute");

    if (![yy, mm, dd, hh, mi2].every(Number.isFinite)) break;

    const gotMinutes = Date.UTC(yy, mm - 1, dd, hh, mi2) / 60000;
    const delta = desiredMinutes - gotMinutes;

    if (delta === 0) break;
    utcMs += delta * 60000;
  }

  return utcMs;
};

const overlaps = (a1: number, a2: number, b1: number, b2: number) =>
  a1 < b2 && b1 < a2;

/* =========================
   RETENTION (SAFE)
========================= */

export const cleanupOldAppointments = mutation({
  args: {},
  handler: async (ctx) => {
    const retentionEnabled = process.env.RETENTION_ENABLED === "true";
    const dryRun = process.env.RETENTION_DRY_RUN !== "false";

    const maxDelete = (() => {
      const raw = process.env.RETENTION_MAX_DELETE;
      const n = raw ? Number(raw) : 10;
      return Number.isFinite(n) && n > 0 ? Math.floor(n) : 10;
    })();

    if (!retentionEnabled) {
      console.log("🧹 Retention skipped (RETENTION_ENABLED != true)");
      return;
    }

    const nowMs = Date.now();
    const cutoffMs = nowMs - 24 * 60 * 60 * 1000;

    const candidates = await ctx.db
      .query("appointments")
      .withIndex("by_startMs", (q) => q.lt("appointmentStartMs", cutoffMs))
      .take(maxDelete);

    console.log("🧹 Retention candidates:", {
      dryRun,
      maxDelete,
      count: candidates.length,
    });

    if (dryRun) {
      console.log(
        "🧹 DRY-RUN ids:",
        candidates.map((a) => ({
          id: a._id,
          appointmentStartMs: a.appointmentStartMs,
        })),
      );
      return;
    }

    for (const apt of candidates) {
      const startMs = apt.appointmentStartMs;

      if (typeof startMs !== "number" || !Number.isFinite(startMs)) {
        console.warn("🧹 Skip invalid startMs", apt._id);
        continue;
      }

      if (startMs > nowMs) {
        console.warn("🧹 Skip future appointment", apt._id);
        continue;
      }

      if (startMs >= cutoffMs) {
        console.warn("🧹 Skip not past cutoff", apt._id);
        continue;
      }

      const logs = await ctx.db
        .query("emailLogs")
        .withIndex("by_appointment", (q) => q.eq("appointmentId", apt._id))
        .collect();

      for (const log of logs) {
        await ctx.db.delete(log._id);
      }

      await ctx.db.delete(apt._id);
    }
  },
});

/* =========================
   BACKFILL
========================= */

export const backfillAppointmentStartMs = mutation({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit = 200 }) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");

    const role = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (role?.role !== "admin") throw new Error("Admin only");

    const rows = await ctx.db
      .query("appointments")
      .order("desc")
      .take(Math.min(1000, limit * 5));

    let updated = 0;
    for (const a of rows) {
      if (updated >= limit) break;
      if (a.appointmentStartMs !== undefined) continue;

      const ms = pragueLocalToUtcMs(a.date, a.time);
      if (!Number.isFinite(ms)) continue;

      await ctx.db.patch(a._id, { appointmentStartMs: ms });
      updated++;
    }

    console.log("🧩 Backfill done:", updated);
    return { updated };
  },
});
