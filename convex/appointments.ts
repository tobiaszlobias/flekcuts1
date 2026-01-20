import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { normalizeEmail, requireAdmin, requireIdentity } from "./authz";

const parseTimeToMinutes = (time: string): number => {
  const [hoursStr, minutesStr = "0"] = time.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
  return hours * 60 + minutes;
};

const pragueLocalToUtcMs = (date: string, time: string): number => {
  // Convert (YYYY-MM-DD, HH:MM) interpreted in Europe/Prague to UTC epoch ms.
  // Uses an iterative Intl-based offset correction to handle DST.
  const [yStr, mStr, dStr] = date.split("-");
  const [hhStr, mmStr = "0"] = time.split(":");
  const year = Number(yStr);
  const month = Number(mStr);
  const day = Number(dStr);
  const hour = Number(hhStr);
  const minute = Number(mmStr);
  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    !Number.isFinite(hour) ||
    !Number.isFinite(minute)
  ) {
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

  const desiredMinutes = Date.UTC(year, month - 1, day, hour, minute) / 60000;
  let utcMs = Date.UTC(year, month - 1, day, hour, minute);

  for (let i = 0; i < 3; i++) {
    const parts = fmt.formatToParts(new Date(utcMs));
    const get = (type: string) => parts.find((p) => p.type === type)?.value;
    const y = Number(get("year"));
    const mo = Number(get("month"));
    const da = Number(get("day"));
    const ho = Number(get("hour"));
    const mi = Number(get("minute"));
    if (![y, mo, da, ho, mi].every(Number.isFinite)) break;
    const gotMinutes = Date.UTC(y, mo - 1, da, ho, mi) / 60000;
    const delta = desiredMinutes - gotMinutes;
    if (delta === 0) break;
    utcMs += delta * 60000;
  }

  return utcMs;
};

const getNowInPrague = (): { date: string; minutes: number } => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Prague",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const get = (type: string) => parts.find((p) => p.type === type)?.value;
  const year = get("year");
  const month = get("month");
  const day = get("day");
  const hour = get("hour");
  const minute = get("minute");

  if (!year || !month || !day || !hour || !minute) {
    const fallback = new Date();
    const date = fallback.toISOString().slice(0, 10);
    return { date, minutes: fallback.getHours() * 60 + fallback.getMinutes() };
  }

  return {
    date: `${year}-${month}-${day}`,
    minutes: Number(hour) * 60 + Number(minute),
  };
};

const isDateWithinNextMonth = (dateString: string): boolean => {
  const date = new Date(dateString + "T00:00:00");
  if (Number.isNaN(date.getTime())) return false;

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const maxDate = new Date(todayStart);
  maxDate.setMonth(maxDate.getMonth() + 1);

  return date >= todayStart && date <= maxDate;
};

const getWeekdayIndexInPrague = (dateString: string): number => {
  const date = new Date(dateString + "T12:00:00Z");
  if (Number.isNaN(date.getTime())) return -1;
  const weekday = new Intl.DateTimeFormat("en-US", {
    timeZone: "Europe/Prague",
    weekday: "short",
  }).format(date);
  const map: Record<string, number> = {
    Sun: 0,
    Mon: 1,
    Tue: 2,
    Wed: 3,
    Thu: 4,
    Fri: 5,
    Sat: 6,
  };
  return map[weekday] ?? -1;
};

type Interval = { start: number; end: number };

const getWorkingHoursForDate = (dateString: string): Interval[] => {
  // Working hours (Prague local):
  // Mon/Wed/Fri: 09:00–11:45, 13:00–17:00
  // Tue:         09:00–11:45, 13:00–17:00
  // Thu:         13:00–19:30
  // Sat/Sun: closed
  const weekday = getWeekdayIndexInPrague(dateString);
  const monTueWedFri: Interval[] = [
    { start: 9 * 60, end: 11 * 60 + 45 },
    { start: 13 * 60, end: 17 * 60 },
  ];
  if (weekday === 1 || weekday === 2 || weekday === 3 || weekday === 5) return monTueWedFri;
  if (weekday === 4) return [{ start: 13 * 60, end: 19 * 60 + 30 }];
  return [];
};

const isWithinWorkingHours = (dateString: string, start: number, end: number): boolean => {
  const intervals = getWorkingHoursForDate(dateString);
  return intervals.some((i) => start >= i.start && end <= i.end);
};

const overlaps = (a1: number, a2: number, b1: number, b2: number) => a1 < b2 && b1 < a2;

const getVacationIntervalsForDate = async (ctx: any, date: string): Promise<Interval[]> => {
  const vacations = await ctx.db.query("vacations").collect();
  const out: Interval[] = [];
  for (const vct of vacations) {
    if (date < vct.startDate || date > vct.endDate) continue;
    const allDay = !vct.startTime && !vct.endTime;
    if (allDay) {
      out.push({ start: 0, end: 24 * 60 });
      continue;
    }
    const start = vct.startTime ? parseTimeToMinutes(vct.startTime) : 0;
    const end = vct.endTime ? parseTimeToMinutes(vct.endTime) : 24 * 60;
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    out.push({ start, end });
  }
  return out;
};

const deriveServiceDurationMinutes = (serviceName: string): number => {
  const normalized = serviceName.trim();

  if (normalized === "Fade") return 45;
  if (normalized === "Klasický střih") return 30;
  if (normalized === "Dětský střih - fade") return 45;
  if (normalized === "Dětský střih - klasický") return 30;
  if (normalized === "Dětský střih - do ztracena") return 30;
  if (normalized === "Vousy") return 15;
  if (normalized === "Mytí vlasů") return 10;
  if (normalized === "Kompletka") return 70;
  if (normalized === "Vlasy do ztracena + Vousy") return 65;

  const hasBeard = normalized.includes("+ Vousy");
  const hasWash = normalized.includes("+ Mytí vlasů");

  let base: number | null = null;
  if (normalized.startsWith("Fade")) base = 45;
  if (normalized.startsWith("Klasický střih")) base = 30;
  if (normalized.startsWith("Dětský střih - fade")) base = 45;
  if (normalized.startsWith("Dětský střih - klasický")) base = 30;
  if (normalized.startsWith("Vousy")) base = 15;
  if (normalized.startsWith("Mytí vlasů")) base = 10;

  if (base === null) return 30;

  if (normalized.startsWith("Fade") && hasBeard) {
    base = 65;
  } else if (hasBeard) {
    base += 15;
  }

  if (hasWash) base += 10;
  return base;
};

// 🆕 NEW: Link anonymous appointments to authenticated user
export const linkAnonymousAppointments = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { userId, email }) => {
    const identity = await requireIdentity(ctx);
    const safeEmail = identity.email ? normalizeEmail(identity.email) : null;
    if (!safeEmail) throw new Error("Missing email on identity");
    if (identity.subject !== userId) throw new Error("Unauthorized");
    if (normalizeEmail(email) !== safeEmail) throw new Error("Unauthorized");

    // Find all anonymous appointments with this email
    const anonymousAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_email", (q) => q.eq("customerEmail", safeEmail))
      .filter((q) => q.eq(q.field("userId"), "anonymous"))
      .collect();

    // Link them to the authenticated user
    for (const appointment of anonymousAppointments) {
      await ctx.db.patch(appointment._id, {
        userId: userId,
      });
    }

    console.log(
      `✅ Linked ${anonymousAppointments.length} anonymous appointments to user ${userId}`
    );
    return anonymousAppointments.length;
  },
});

export const linkMyAnonymousAppointments = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);
    const safeEmail = identity.email ? normalizeEmail(identity.email) : null;
    if (!safeEmail) return 0;

    const anonymousAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_email", (q) => q.eq("customerEmail", safeEmail))
      .filter((q) => q.eq(q.field("userId"), "anonymous"))
      .collect();

    for (const appointment of anonymousAppointments) {
      await ctx.db.patch(appointment._id, { userId: identity.subject });
    }

    console.log(`✅ Linked ${anonymousAppointments.length} anonymous appointments to current user`);
    return anonymousAppointments.length;
  },
});

// Get all appointments for the current user (including anonymous by email)
export const getMyAppointments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await requireIdentity(ctx);

    const mine = await ctx.db
      .query("appointments")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    const emailRaw = identity.email;
    if (!emailRaw) return mine;
    const emailNorm = normalizeEmail(emailRaw);
    const emailsToTry = emailNorm !== emailRaw ? [emailRaw, emailNorm] : [emailRaw];
    const anonymousByEmailLists = await Promise.all(
      emailsToTry.map((e) =>
        ctx.db
          .query("appointments")
          .withIndex("by_email", (q) => q.eq("customerEmail", e))
          .filter((q: any) => q.eq(q.field("userId"), "anonymous"))
          .collect()
      )
    );
    const anonymousByEmail = anonymousByEmailLists.flat();

    const merged = [...mine, ...anonymousByEmail];
    merged.sort((a, b) => {
      const aStart = a.appointmentStartMs ?? pragueLocalToUtcMs(a.date, a.time);
      const bStart = b.appointmentStartMs ?? pragueLocalToUtcMs(b.date, b.time);
      return (bStart || 0) - (aStart || 0);
    });
    return merged;
  },
});

// Create a new appointment - 🆕 NOW WITH AUTO-EMAIL!
export const createAppointment = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
    service: v.string(),
    date: v.string(),
    time: v.string(),
    durationMinutes: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }
    const safeEmail = normalizeEmail(args.customerEmail);

    if (!isDateWithinNextMonth(args.date)) {
      throw new Error("Appointments can only be booked up to 1 month in advance.");
    }

    const newStart = parseTimeToMinutes(args.time);
    if (!Number.isFinite(newStart)) {
      throw new Error("Invalid time format.");
    }

    const now = getNowInPrague();
    if (args.date < now.date) {
      throw new Error("Appointments must be in the future.");
    }
    if (args.date === now.date && newStart < now.minutes + 1) {
      throw new Error("Appointments must be in the future.");
    }
    if (args.date === now.date && newStart < now.minutes + 120) {
      throw new Error("Appointments must be booked at least 2 hours in advance.");
    }

    const derivedDuration = deriveServiceDurationMinutes(args.service);
    const newDuration = args.durationMinutes ?? derivedDuration;
    const newEnd = newStart + newDuration;
    const appointmentStartMs = pragueLocalToUtcMs(args.date, args.time);

    if (!isWithinWorkingHours(args.date, newStart, newEnd)) {
      throw new Error("Selected time is outside working hours.");
    }

    const vacationIntervals = await getVacationIntervalsForDate(ctx, args.date);
    if (vacationIntervals.some((v) => overlaps(newStart, newEnd, v.start, v.end))) {
      throw new Error("Selected time is during vacation.");
    }

    // Check for overlapping appointments on the same date (ignore cancelled)
    const existingAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    for (const existing of existingAppointments) {
      const existingStart = parseTimeToMinutes(existing.time);
      if (!Number.isFinite(existingStart)) continue;
      const existingDerived = deriveServiceDurationMinutes(existing.service);
      const existingDuration = existingDerived;
      const existingEnd = existingStart + existingDuration;

      if (overlaps(newStart, newEnd, existingStart, existingEnd)) {
        throw new Error("An appointment already exists at this time.");
      }
    }

    const appointmentId = await ctx.db.insert("appointments", {
      userId: identity.subject,
      customerName: args.customerName,
      customerEmail: safeEmail,
      service: args.service,
      date: args.date,
      time: args.time,
      appointmentStartMs: Number.isFinite(appointmentStartMs) ? appointmentStartMs : undefined,
      status: "pending",
      notes: args.notes,
    });

    // 🆕 NEW: Auto-send confirmation email
    try {
      await ctx.scheduler.runAfter(0, internal.notifications.sendAppointmentConfirmation, {
        appointmentId,
      });
      console.log("✅ Confirmation email scheduled for:", appointmentId);
    } catch (error) {
      console.error("❌ Failed to schedule confirmation email:", error);
    }

    return appointmentId;
  },
});

// 🆕 NEW: Create anonymous appointment (not linked to any user)
export const createAnonymousAppointment = mutation({
  args: {
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.string(),
    service: v.string(),
    date: v.string(),
    time: v.string(),
    durationMinutes: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const safeEmail = normalizeEmail(args.customerEmail);
    if (!isDateWithinNextMonth(args.date)) {
      throw new Error("Appointments can only be booked up to 1 month in advance.");
    }

    const newStart = parseTimeToMinutes(args.time);
    if (!Number.isFinite(newStart)) {
      throw new Error("Invalid time format.");
    }

    const now = getNowInPrague();
    if (args.date < now.date) {
      throw new Error("Appointments must be in the future.");
    }
    if (args.date === now.date && newStart < now.minutes + 1) {
      throw new Error("Appointments must be in the future.");
    }
    if (args.date === now.date && newStart < now.minutes + 120) {
      throw new Error("Appointments must be booked at least 2 hours in advance.");
    }

    const derivedDuration = deriveServiceDurationMinutes(args.service);
    const newDuration = args.durationMinutes ?? derivedDuration;
    const newEnd = newStart + newDuration;
    const appointmentStartMs = pragueLocalToUtcMs(args.date, args.time);

    if (!isWithinWorkingHours(args.date, newStart, newEnd)) {
      throw new Error("Selected time is outside working hours.");
    }

    const vacationIntervals = await getVacationIntervalsForDate(ctx, args.date);
    if (vacationIntervals.some((v) => overlaps(newStart, newEnd, v.start, v.end))) {
      throw new Error("Selected time is during vacation.");
    }

    // Check for overlapping appointments on the same date (ignore cancelled)
    const existingAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .collect();

    for (const existing of existingAppointments) {
      const existingStart = parseTimeToMinutes(existing.time);
      if (!Number.isFinite(existingStart)) continue;
      const existingDerived = deriveServiceDurationMinutes(existing.service);
      const existingDuration = existingDerived;
      const existingEnd = existingStart + existingDuration;

      if (overlaps(newStart, newEnd, existingStart, existingEnd)) {
        throw new Error("An appointment already exists at this time.");
      }
    }

    const appointmentId = await ctx.db.insert("appointments", {
      userId: "anonymous",
      customerName: args.customerName,
      customerEmail: safeEmail,
      customerPhone: args.customerPhone,
      service: args.service,
      date: args.date,
      time: args.time,
      appointmentStartMs: Number.isFinite(appointmentStartMs) ? appointmentStartMs : undefined,
      status: "pending",
      notes: args.notes,
    });

    try {
      await ctx.scheduler.runAfter(0, internal.notifications.sendAppointmentConfirmation, {
        appointmentId,
      });
      console.log("✅ Anonymous confirmation email scheduled for:", appointmentId);
    } catch (error) {
      console.error("❌ Failed to schedule anonymous confirmation email:", error);
    }

    return appointmentId;
  },
});

// Cancel an appointment - 🆕 NOW WITH AUTO-EMAIL!
export const cancelAppointment = mutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const nowMs = Date.now();

    // Make sure user can only cancel their own appointments
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment) {
      throw new Error("Appointment not found or unauthorized");
    }

    const isOwner =
      appointment.userId === identity.subject ||
      (appointment.userId === "anonymous" &&
        !!identity.email &&
        identity.email === appointment.customerEmail);

    if (!isOwner) {
      throw new Error("Appointment not found or unauthorized");
    }

    const startMs =
      appointment.appointmentStartMs ?? pragueLocalToUtcMs(appointment.date, appointment.time);
    if (!Number.isFinite(startMs)) {
      throw new Error("Invalid appointment time.");
    }

    // Enforce online cancellation only up to 24 hours before appointment
    if (startMs < nowMs + 24 * 60 * 60 * 1000) {
      throw new Error("Online cancellation is only possible up to 24 hours before the appointment.");
    }

    // Update to cancelled status
    await ctx.db.patch(args.appointmentId, { status: "cancelled" });

    // 🆕 NEW: Auto-send cancellation email
    try {
      await ctx.scheduler.runAfter(0, internal.notifications.sendStatusUpdate, {
        appointmentId: args.appointmentId,
        newStatus: "cancelled",
      });
      console.log("✅ Cancellation email scheduled for:", args.appointmentId);
    } catch (error) {
      console.error("❌ Failed to schedule cancellation email:", error);
    }
  },
});

export const cleanupOldAppointments = internalMutation({
  args: {},
  handler: async (ctx) => {
    const retentionEnabled = process.env.RETENTION_ENABLED === "true";
    const dryRun = process.env.RETENTION_DRY_RUN !== "false";
    const maxDelete = (() => {
      const raw = process.env.RETENTION_MAX_DELETE;
      const parsed = raw ? Number(raw) : 10;
      return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 10;
    })();

    if (!retentionEnabled) {
      console.log("🧹 Retention cleanup skipped (RETENTION_ENABLED is not true).");
      return;
    }

    const nowMs = Date.now();
    const cutoffMs = nowMs - 24 * 60 * 60 * 1000;

    const candidates = await ctx.db
      .query("appointments")
      .withIndex("by_startMs", (q) => q.lt("appointmentStartMs", cutoffMs))
      .take(maxDelete);

    console.log("🧹 Retention cleanup candidates:", {
      cutoffMs,
      nowMs,
      deleting: dryRun ? 0 : candidates.length,
      dryRun,
      maxDelete,
      minStartMs: candidates.reduce<number | null>((min, apt) => {
        const v = apt.appointmentStartMs;
        if (!Number.isFinite(v)) return min;
        return min === null ? (v as number) : Math.min(min, v as number);
      }, null),
      maxStartMs: candidates.reduce<number | null>((max, apt) => {
        const v = apt.appointmentStartMs;
        if (!Number.isFinite(v)) return max;
        return max === null ? (v as number) : Math.max(max, v as number);
      }, null),
    });

    if (dryRun) {
      console.log(
        "🧹 Retention dry-run ids:",
        candidates.map((apt) => ({
          id: apt._id,
          appointmentStartMs: apt.appointmentStartMs,
        }))
      );
      return;
    }

    for (const apt of candidates) {
      const startMs = apt.appointmentStartMs;
      if (typeof startMs !== "number" || !Number.isFinite(startMs)) {
        console.warn("🧹 Skipping retention delete due to invalid appointmentStartMs:", apt._id);
        continue;
      }
      if (startMs > nowMs) {
        console.warn("🧹 Skipping retention delete for future appointmentStartMs:", {
          id: apt._id,
          startMs,
          nowMs,
        });
        continue;
      }
      if (startMs >= cutoffMs) {
        console.warn("🧹 Skipping retention delete due to startMs not past cutoff:", {
          id: apt._id,
          startMs,
          cutoffMs,
        });
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

export const backfillAppointmentStartMs = mutation({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);
    if (process.env.ADMIN_MAINTENANCE_ENABLED !== "true") {
      throw new Error("Maintenance disabled (set ADMIN_MAINTENANCE_ENABLED=true)");
    }

    const limit = (() => {
      const raw = args.limit ?? 200;
      const n = Number(raw);
      return Number.isFinite(n) && n > 0 ? Math.min(500, Math.floor(n)) : 200;
    })();

    const legacy = await ctx.db.query("appointments").order("desc").take(Math.min(1000, limit * 5));

    let updated = 0;
    for (const apt of legacy) {
      if (updated >= limit) break;
      if (apt.appointmentStartMs !== undefined) continue;
      const startMs = pragueLocalToUtcMs(apt.date, apt.time);
      if (!Number.isFinite(startMs)) continue;
      await ctx.db.patch(apt._id, { appointmentStartMs: startMs });
      updated += 1;
    }

    console.log("🧩 Backfilled appointmentStartMs:", { updated, limit });
    return { updated, limit };
  },
});

export const importReconstructedAppointments = mutation({
  args: {
    items: v.array(
      v.object({
        customerName: v.union(v.string(), v.null()),
        customerEmail: v.union(v.string(), v.null()),
        customerPhone: v.optional(v.union(v.string(), v.null())),
        service: v.union(v.string(), v.null()),
        date: v.union(v.string(), v.null()),
        time: v.union(v.string(), v.null()),
        notes: v.optional(v.union(v.string(), v.null())),
        sourceResendId: v.union(v.string(), v.null()),
        sourceTimestamp: v.union(v.string(), v.null()),
      })
    ),
    dryRun: v.optional(v.boolean()),
    maxInsert: v.optional(v.number()),
    confirmToken: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await requireAdmin(ctx);

    if (process.env.RECOVERY_IMPORT_ENABLED !== "true") {
      throw new Error("Recovery import disabled (set RECOVERY_IMPORT_ENABLED=true)");
    }
    const expectedToken = process.env.RECOVERY_IMPORT_CONFIRM_TOKEN;
    if (!expectedToken) {
      throw new Error("Missing RECOVERY_IMPORT_CONFIRM_TOKEN env var");
    }
    if (args.confirmToken !== expectedToken) {
      throw new Error("Invalid confirmToken");
    }

    const dryRun = args.dryRun !== false;
    const maxInsert = (() => {
      const raw = args.maxInsert ?? 200;
      const n = Number(raw);
      return Number.isFinite(n) && n > 0 ? Math.min(1000, Math.floor(n)) : 200;
    })();

    const results = {
      inserted: 0,
      wouldInsert: 0,
      skippedDuplicate: 0,
      skippedDuplicateInBatch: 0,
      skippedInvalid: 0,
      skippedConflict: 0,
      processed: 0,
      dryRun,
      maxInsert,
    };

    const seen = new Set<string>();
    const isValidDate = (s: string) => /^\d{4}-\d{2}-\d{2}$/.test(s);
    const isValidTime = (s: string) => /^\d{1,2}:\d{2}$/.test(s);

    for (const item of args.items) {
      if (!dryRun && results.inserted >= maxInsert) break;
      if (dryRun && results.wouldInsert >= maxInsert) break;
      results.processed += 1;

      const customerName = typeof item.customerName === "string" ? item.customerName.trim() : "";
      const customerEmailRaw =
        typeof item.customerEmail === "string" ? item.customerEmail.trim() : "";
      const service = typeof item.service === "string" ? item.service.trim() : "";
      const date = typeof item.date === "string" ? item.date.trim() : "";
      const time = typeof item.time === "string" ? item.time.trim() : "";
      const customerPhone =
        typeof item.customerPhone === "string" ? item.customerPhone.trim() : undefined;
      const notes = typeof item.notes === "string" ? item.notes.trim() : undefined;
      const sourceResendId =
        typeof item.sourceResendId === "string" ? item.sourceResendId.trim() : "";
      const sourceTimestamp =
        typeof item.sourceTimestamp === "string" ? item.sourceTimestamp.trim() : "";

      const customerEmail = customerEmailRaw ? normalizeEmail(customerEmailRaw) : "";
      const hasCore = !!customerName && !!customerEmail && !!service && !!date && !!time;
      if (!hasCore || !isValidDate(date) || !isValidTime(time)) {
        results.skippedInvalid += 1;
        continue;
      }

      const key = `${customerEmail}|${date}|${time}|${service}`;
      if (seen.has(key)) {
        results.skippedDuplicateInBatch += 1;
        continue;
      }
      seen.add(key);

      const existingAtTime = await ctx.db
        .query("appointments")
        .withIndex("by_date_time", (q) => q.eq("date", date).eq("time", time))
        .collect();

      const duplicate = existingAtTime.some(
        (a) =>
          a.customerEmail === customerEmail &&
          a.service === service &&
          a.date === date &&
          a.time === time
      );
      if (duplicate) {
        results.skippedDuplicate += 1;
        continue;
      }

      if (existingAtTime.length > 0) {
        results.skippedConflict += 1;
        continue;
      }

      const appointmentStartMs = pragueLocalToUtcMs(date, time);
      if (!Number.isFinite(appointmentStartMs)) {
        results.skippedInvalid += 1;
        continue;
      }

      const combinedNotes = [
        notes,
        sourceResendId ? `Recovered from Resend: ${sourceResendId}` : null,
        sourceTimestamp ? `Source timestamp: ${sourceTimestamp}` : null,
      ]
        .filter(Boolean)
        .join("\n");

      if (dryRun) {
        results.wouldInsert += 1;
        continue;
      }

      await ctx.db.insert("appointments", {
        userId: "anonymous",
        customerName,
        customerEmail,
        customerPhone: customerPhone ? customerPhone : undefined,
        service,
        date,
        time,
        appointmentStartMs,
        status: "pending",
        notes: combinedNotes ? combinedNotes : undefined,
      });

      results.inserted += 1;
    }

    console.log("🧩 Import reconstructed appointments:", results);
    return results;
  },
});

// 🆕 BONUS: Get all appointments (admin only) - including anonymous ones
export const getAllAppointments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Check if user is admin
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .first();

    if (userRole?.role !== "admin") {
      throw new Error("Admin access required");
    }

    return await ctx.db.query("appointments").order("desc").collect();
  },
});

// Get all appointments for a given date
export const getAppointmentsByDate = query({
  args: { date: v.string() },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
    // Public booking UI only needs to know which slots are occupied.
    return appointments.map((a) => ({ time: a.time, service: a.service, status: a.status }));
  },
});
