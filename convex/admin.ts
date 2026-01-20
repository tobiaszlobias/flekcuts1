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

  return true;
};

// Get all appointments for admin view
export const getAllAppointments = query({
  args: {},
  handler: async (ctx) => {
    await checkIsAdmin(ctx);

    return await ctx.db.query("appointments").order("desc").collect();
  },
});

// Update appointment status (admin only) - 🆕 NOW WITH AUTO-EMAIL!
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

    // Update the appointment status
    await ctx.db.patch(args.appointmentId, {
      status: args.status,
    });

    // 🆕 NEW: Auto-send status update email
    try {
      await ctx.scheduler.runAfter(0, internal.notifications.sendStatusUpdate, {
        appointmentId: args.appointmentId,
        newStatus: args.status,
      });
      console.log("✅ Status update email scheduled for:", args.appointmentId);
    } catch (error) {
      console.error("❌ Failed to schedule status update email:", error);
      // Don't throw - status update should succeed even if email fails
    }
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
