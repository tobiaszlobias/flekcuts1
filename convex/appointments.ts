import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

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

const getWorkingPeriodsForWeekday = (weekdayIndex: number): Array<[number, number]> => {
  // Minutes from midnight, Europe/Prague local business hours:
  // Mon/Tue/Wed/Fri: 09:00–11:45 and 13:00–17:00
  // Thu: 13:00–19:30
  // Sat/Sun: closed
  switch (weekdayIndex) {
    case 1:
    case 2:
    case 3:
    case 5:
      return [
        [9 * 60, 11 * 60 + 45],
        [13 * 60, 17 * 60],
      ];
    case 4:
      return [[13 * 60, 19 * 60 + 30]];
    default:
      return [];
  }
};

const isWithinWorkingHours = (dateString: string, startMinutes: number, endMinutes: number) => {
  const weekday = getWeekdayIndexInPrague(dateString);
  const periods = getWorkingPeriodsForWeekday(weekday);
  return periods.some(([pStart, pEnd]) => startMinutes >= pStart && endMinutes <= pEnd);
};

const deriveServiceDurationMinutes = (serviceName: string): number => {
  const normalized = serviceName.trim();

  // Base services
  if (normalized === "Fade") return 45;
  if (normalized === "Klasický střih") return 30;
  if (normalized === "Dětský střih - fade") return 45;
  if (normalized === "Dětský střih - klasický") return 30;
  if (normalized === "Dětský střih - do ztracena") return 30;
  if (normalized === "Vousy") return 15;
  if (normalized === "Mytí vlasů") return 10;
  if (normalized === "Kompletka") return 70;

  // Legacy naming
  if (normalized === "Vlasy do ztracena + Vousy") return 65;

  // Combos (built from base + add-ons)
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
    // Special-case duration per your list: Fade + Vousy = 65 min (not 60).
    base = 65;
  } else if (hasBeard) {
    base += 15;
  }

  if (hasWash) base += 10;

  return base;
};

const overlaps = (
  startA: number,
  endA: number,
  startB: number,
  endB: number
): boolean => startA < endB && startB < endA;

const getVacationIntervalsForDate = async (
  ctx: any,
  date: string
): Promise<Array<{ start: number; end: number }>> => {
  const vacations = await ctx.db
    .query("vacations")
    .withIndex("by_startDate", (q: any) => q.lte("startDate", date))
    .filter((q: any) => q.gte(q.field("endDate"), date))
    .collect();

  const intervals: Array<{ start: number; end: number }> = [];
  for (const v of vacations) {
    // Full-day vacation
    if (!v.startTime || !v.endTime) {
      intervals.push({ start: 0, end: 24 * 60 });
      continue;
    }
    const start = parseTimeToMinutes(v.startTime);
    const end = parseTimeToMinutes(v.endTime);
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    intervals.push({ start, end });
  }
  return intervals;
};

// 🆕 NEW: Link anonymous appointments to authenticated user
export const linkAnonymousAppointments = mutation({
  args: {
    userId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, { userId, email }) => {
    // Find all anonymous appointments with this email
    const anonymousAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_email", (q) => q.eq("customerEmail", email))
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

// Get all appointments for the current user
export const getMyAppointments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const mine = await ctx.db
      .query("appointments")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();

    const email = identity.email;
    if (!email) return mine;

    const anonymousByEmail = await ctx.db
      .query("appointments")
      .withIndex("by_email", (q) => q.eq("customerEmail", email))
      .filter((q) => q.eq(q.field("userId"), "anonymous"))
      .collect();

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
    if (
      vacationIntervals.some((v) => overlaps(newStart, newEnd, v.start, v.end))
    ) {
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

    // Create the appointment (your existing code)
    const appointmentId = await ctx.db.insert("appointments", {
      userId: identity.subject,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      service: args.service,
      date: args.date,
      time: args.time,
      appointmentStartMs: Number.isFinite(appointmentStartMs) ? appointmentStartMs : undefined,
      status: "pending",
      notes: args.notes,
    });

    // 🆕 NEW: Auto-send confirmation email
    try {
      await ctx.scheduler.runAfter(
        0,
        api.notifications.sendAppointmentConfirmation,
        {
          appointmentId,
        }
      );
      console.log("✅ Confirmation email scheduled for:", appointmentId);
    } catch (error) {
      console.error("❌ Failed to schedule confirmation email:", error);
      // Don't throw - appointment creation should succeed even if email fails
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
    if (
      vacationIntervals.some((v) => overlaps(newStart, newEnd, v.start, v.end))
    ) {
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

    // Create the appointment without requiring authentication
    const appointmentId = await ctx.db.insert("appointments", {
      userId: "anonymous", // Use a special marker for anonymous appointments
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      customerPhone: args.customerPhone,
      service: args.service,
      date: args.date,
      time: args.time,
      appointmentStartMs: Number.isFinite(appointmentStartMs) ? appointmentStartMs : undefined,
      status: "pending",
      notes: args.notes,
    });

    // 🆕 AUTO-SEND confirmation email for anonymous bookings too
    try {
      await ctx.scheduler.runAfter(
        0,
        api.notifications.sendAppointmentConfirmation,
        {
          appointmentId,
        }
      );
      console.log(
        "✅ Anonymous confirmation email scheduled for:",
        appointmentId
      );
    } catch (error) {
      console.error(
        "❌ Failed to schedule anonymous confirmation email:",
        error
      );
      // Don't throw - appointment creation should succeed even if email fails
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
      await ctx.scheduler.runAfter(0, api.notifications.sendStatusUpdate, {
        appointmentId: args.appointmentId,
        newStatus: "cancelled",
      });
      console.log("✅ Cancellation email scheduled for:", args.appointmentId);
    } catch (error) {
      console.error("❌ Failed to schedule cancellation email:", error);
    }
  },
});

export const cleanupOldAppointments = mutation({
  args: {},
  handler: async (ctx) => {
    const cutoffMs = Date.now() - 24 * 60 * 60 * 1000;

    // Primary path: indexed cleanup (appointments with appointmentStartMs set)
    const toDelete = await ctx.db
      .query("appointments")
      .withIndex("by_startMs", (q) => q.lt("appointmentStartMs", cutoffMs))
      .collect();

    for (const apt of toDelete) {
      const logs = await ctx.db
        .query("emailLogs")
        .withIndex("by_appointment", (q) => q.eq("appointmentId", apt._id))
        .collect();
      for (const log of logs) {
        await ctx.db.delete(log._id);
      }
      await ctx.db.delete(apt._id);
    }

    // Fallback: for older records without appointmentStartMs (best-effort)
    const now = getNowInPrague();
    const [y, m, d] = now.date.split("-").map(Number);
    const cutoffDateUtc = new Date(Date.UTC(y, m - 1, d) - 2 * 24 * 60 * 60 * 1000);
    const cutoffDateStr = cutoffDateUtc.toISOString().slice(0, 10);
    const olderByDate = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.lte("date", cutoffDateStr))
      .collect();

    for (const apt of olderByDate) {
      if (apt.appointmentStartMs !== undefined) continue;
      const startMs = pragueLocalToUtcMs(apt.date, apt.time);
      if (!Number.isFinite(startMs)) continue;
      if (startMs >= cutoffMs) continue;

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
    return await ctx.db
      .query("appointments")
      .withIndex("by_date", (q) => q.eq("date", args.date))
      .collect();
  },
});

// ===============================
// 🐛 DEBUG FUNCTIONS
// ===============================

// Debug: Check all appointments in database
export const debugAllAppointments = query({
  args: {},
  handler: async (ctx) => {
    const allAppointments = await ctx.db.query("appointments").collect();
    console.log(
      "🔍 ALL APPOINTMENTS IN DATABASE:",
      allAppointments.map((a) => ({
        id: a._id,
        userId: a.userId,
        customerName: a.customerName,
        customerEmail: a.customerEmail,
        service: a.service,
        date: a.date,
        time: a.time,
        status: a.status,
      }))
    );
    return allAppointments;
  },
});

// Debug: Check all users in database
export const debugAllUsers = query({
  args: {},
  handler: async (ctx) => {
    const allUsers = await ctx.db.query("users").collect();
    console.log("🔍 ALL USERS IN DATABASE:", allUsers);
    return allUsers;
  },
});

// Debug: Check appointments for specific email
export const debugAppointmentsByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_email", (q) => q.eq("customerEmail", args.email))
      .collect();

    console.log(
      `🔍 APPOINTMENTS FOR EMAIL ${args.email}:`,
      appointments.map((a) => ({
        id: a._id,
        userId: a.userId,
        customerName: a.customerName,
        service: a.service,
        date: a.date,
        time: a.time,
        status: a.status,
      }))
    );

    return appointments;
  },
});

// Debug: Get current user ID
export const debugCurrentUser = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    console.log("🔍 CURRENT USER IDENTITY:", identity);
    return identity;
  },
});

// Manual function to link appointments (for testing)
export const manualLinkAppointments = mutation({
  args: {
    email: v.string(),
    userId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    const targetUserId = args.userId || identity?.subject;

    if (!targetUserId) {
      throw new Error("No user ID provided and not authenticated");
    }

    console.log(
      `🔗 MANUAL LINKING: Looking for appointments with email ${args.email} to link to user ${targetUserId}`
    );

    // Find anonymous appointments
    const anonymousAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_email", (q) => q.eq("customerEmail", args.email))
      .filter((q) => q.eq(q.field("userId"), "anonymous"))
      .collect();

    console.log(
      `📊 Found ${anonymousAppointments.length} anonymous appointments`
    );

    // Link them
    for (const appointment of anonymousAppointments) {
      await ctx.db.patch(appointment._id, { userId: targetUserId });
      console.log(`✅ Linked appointment ${appointment._id}`);
    }

    return `Linked ${anonymousAppointments.length} appointments`;
  },
});
