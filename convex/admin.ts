import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";

// Helper function to check if user is admin
const checkIsAdmin = async (ctx: any) => {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Not authenticated");
  }

  const userRole = await ctx.db
    .query("userRoles")
    .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
    .first();

  if (userRole?.role !== "admin") {
    throw new Error("Admin access required");
  }

  return identity;
};

const parseTimeToMinutes = (time: string): number => {
  const [hoursStr, minutesStr = "0"] = time.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
  return hours * 60 + minutes;
};

const overlaps = (a1: number, a2: number, b1: number, b2: number) => a1 < b2 && b1 < a2;

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

// Get all appointments for admin view
export const getAllAppointments = query({
  args: {},
  handler: async (ctx) => {
    await checkIsAdmin(ctx);

    return await ctx.db.query("appointments").order("desc").collect();
  },
});

// Update appointment status (admin only)
export const updateAppointmentStatus = mutation({
  args: {
    appointmentId: v.id("appointments"),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled")
    ),
  },
  handler: async (ctx, args) => {
    await checkIsAdmin(ctx);

    // Status is used as internal admin workflow marker; no customer notification here.
    await ctx.db.patch(args.appointmentId, {
      status: args.status,
    });
  },
});

// Delete appointment (admin only)
export const deleteAppointment = mutation({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    await checkIsAdmin(ctx);

    const logs = await ctx.db
      .query("emailLogs")
      .withIndex("by_appointment", (q: any) => q.eq("appointmentId", args.appointmentId))
      .collect();
    for (const log of logs) {
      await ctx.db.delete(log._id);
    }
    await ctx.db.delete(args.appointmentId);
  },
});

// Get appointment statistics - 🆕 NOW WITH EMAIL STATS!
export const getAppointmentStats = query({
  args: {},
  handler: async (ctx) => {
    await checkIsAdmin(ctx);

    const appointments = await ctx.db.query("appointments").collect();

    const stats = {
      total: appointments.length,
      pending: appointments.filter((a) => a.status === "pending").length,
      confirmed: appointments.filter((a) => a.status === "confirmed").length,
      cancelled: appointments.filter((a) => a.status === "cancelled").length,
      today: appointments.filter((a) => {
        const today = new Date().toISOString().split("T")[0];
        return a.date === today;
      }).length,
    };

    return stats;
  },
});

// 🆕 NEW: Get combined appointment + email stats for admin dashboard
export const getAdminDashboardStats = query({
  args: {},
  handler: async (ctx) => {
    await checkIsAdmin(ctx);

    const appointments = await ctx.db.query("appointments").collect();
    const emailLogs = await ctx.db.query("emailLogs").collect();

    return {
      appointments: {
        total: appointments.length,
        pending: appointments.filter((a) => a.status === "pending").length,
        confirmed: appointments.filter((a) => a.status === "confirmed").length,
        cancelled: appointments.filter((a) => a.status === "cancelled").length,
        today: appointments.filter((a) => {
          const today = new Date().toISOString().split("T")[0];
          return a.date === today;
        }).length,
      },
      emails: {
        total: emailLogs.length,
        sent: emailLogs.filter((log) => log.status === "sent").length,
        failed: emailLogs.filter((log) => log.status === "failed").length,
        todaysSent: emailLogs.filter((log) => {
          const today = new Date().toISOString().split("T")[0];
          const logDate = new Date(log.sentAt).toISOString().split("T")[0];
          return logDate === today && log.status === "sent";
        }).length,
      },
    };
  },
});

// 🆕 NEW: Manual email controls for admin
export const manualSendConfirmation = mutation({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args) => {
    await checkIsAdmin(ctx);

    // Schedule the email
    await ctx.scheduler.runAfter(
      0,
      internal.notifications.sendAppointmentConfirmation,
      {
        appointmentId: args.appointmentId,
      }
    );

    return { success: true, message: "Confirmation email scheduled" };
  },
});

export const manualSendReminder = mutation({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args) => {
    await checkIsAdmin(ctx);

    // Schedule the email
    await ctx.scheduler.runAfter(0, internal.notifications.sendAppointmentReminder, {
      appointmentId: args.appointmentId,
    });

    return { success: true, message: "Reminder email scheduled" };
  },
});

export const triggerDailyReminders = mutation({
  args: {},
  handler: async (ctx) => {
    await checkIsAdmin(ctx);

    // Manually trigger daily reminders
    await ctx.scheduler.runAfter(0, internal.notifications.sendDailyReminders, {});

    return { success: true, message: "Daily reminders triggered" };
  },
});

// ===============================
// Vacations (admin only)
// ===============================

export const getAllVacations = query({
  args: {},
  handler: async (ctx) => {
    await checkIsAdmin(ctx);
    return await ctx.db.query("vacations").order("desc").collect();
  },
});

export const createVacation = mutation({
  args: {
    startDate: v.string(),
    endDate: v.string(),
    startTime: v.optional(v.string()),
    endTime: v.optional(v.string()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkIsAdmin(ctx);

    if (args.endDate < args.startDate) {
      throw new Error("Invalid vacation date range.");
    }

    if ((args.startTime && !args.endTime) || (!args.startTime && args.endTime)) {
      throw new Error("Provide both startTime and endTime, or neither.");
    }

    if (args.startTime && args.endTime && args.endTime <= args.startTime) {
      throw new Error("Invalid vacation time range.");
    }

    return await ctx.db.insert("vacations", {
      startDate: args.startDate,
      endDate: args.endDate,
      startTime: args.startTime,
      endTime: args.endTime,
      note: args.note,
      createdAt: new Date().toISOString(),
    });
  },
});

export const deleteVacation = mutation({
  args: { vacationId: v.id("vacations") },
  handler: async (ctx, args) => {
    await checkIsAdmin(ctx);
    await ctx.db.delete(args.vacationId);
  },
});

// ===============================
// Internal blocks (admin only, per-user)
// ===============================

export const getMyInternalBlocks = query({
  args: {},
  handler: async (ctx) => {
    const identity = await checkIsAdmin(ctx);
    return await ctx.db
      .query("internalBlocks")
      .withIndex("by_user", (q: any) => q.eq("createdByUserId", identity.subject))
      .order("desc")
      .collect();
  },
});

export const createInternalBlock = mutation({
  args: {
    date: v.string(),
    time: v.string(),
    service: v.optional(v.string()),
    durationMinutes: v.optional(v.number()),
    note: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await checkIsAdmin(ctx);

    const start = parseTimeToMinutes(args.time);
    if (!Number.isFinite(start)) throw new Error("Invalid time format.");

    const durationMinutes =
      args.durationMinutes ?? deriveServiceDurationMinutes(args.service ?? "");
    if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) {
      throw new Error("Invalid duration.");
    }
    const end = start + durationMinutes;

    // Prevent overlap with existing appointments (ignore cancelled)
    const existingAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_date", (q: any) => q.eq("date", args.date))
      .filter((q: any) => q.neq(q.field("status"), "cancelled"))
      .collect();

    for (const existing of existingAppointments) {
      const existingStart = parseTimeToMinutes(existing.time);
      if (!Number.isFinite(existingStart)) continue;
      const existingDuration = deriveServiceDurationMinutes(existing.service);
      const existingEnd = existingStart + existingDuration;
      if (overlaps(start, end, existingStart, existingEnd)) {
        throw new Error("An appointment already exists at this time.");
      }
    }

    // Prevent overlap with other internal blocks for this user
    const existingBlocks = await ctx.db
      .query("internalBlocks")
      .withIndex("by_user", (q: any) => q.eq("createdByUserId", identity.subject))
      .collect();
    for (const block of existingBlocks) {
      if (block.date !== args.date) continue;
      const blockStart = parseTimeToMinutes(block.time);
      if (!Number.isFinite(blockStart)) continue;
      const blockEnd = blockStart + (block.durationMinutes ?? 0);
      if (overlaps(start, end, blockStart, blockEnd)) {
        throw new Error("An internal block already exists at this time.");
      }
    }

    return await ctx.db.insert("internalBlocks", {
      createdByUserId: identity.subject,
      date: args.date,
      time: args.time,
      durationMinutes,
      service: args.service?.trim() ? args.service.trim() : undefined,
      note: args.note?.trim() ? args.note.trim() : undefined,
      createdAt: new Date().toISOString(),
    });
  },
});

export const deleteInternalBlock = mutation({
  args: { blockId: v.id("internalBlocks") },
  handler: async (ctx, args) => {
    const identity = await checkIsAdmin(ctx);
    const block = await ctx.db.get(args.blockId);
    if (!block) return;
    if (block.createdByUserId !== identity.subject) {
      throw new Error("Unauthorized");
    }
    await ctx.db.delete(args.blockId);
  },
});
