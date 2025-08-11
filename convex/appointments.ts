import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

// Get all appointments for the current user
export const getMyAppointments = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("appointments")
      .withIndex("by_user", (q) => q.eq("userId", identity.subject))
      .order("desc")
      .collect();
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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Check for existing appointment at the same date and time
    const existingAppointment = await ctx.db
      .query("appointments")
      .withIndex("by_date_time", (q) =>
        q.eq("date", args.date).eq("time", args.time)
      )
      .first();

    if (existingAppointment) {
      throw new Error("An appointment already exists at this time.");
    }

    // Create the appointment (your existing code)
    const appointmentId = await ctx.db.insert("appointments", {
      userId: identity.subject,
      customerName: args.customerName,
      customerEmail: args.customerEmail,
      service: args.service,
      date: args.date,
      time: args.time,
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
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Check for existing appointment at the same date and time
    const existingAppointment = await ctx.db
      .query("appointments")
      .withIndex("by_date_time", (q) =>
        q.eq("date", args.date).eq("time", args.time)
      )
      .first();

    if (existingAppointment) {
      throw new Error("An appointment already exists at this time.");
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

    // Make sure user can only cancel their own appointments
    const appointment = await ctx.db.get(args.appointmentId);
    if (!appointment || appointment.userId !== identity.subject) {
      throw new Error("Appointment not found or unauthorized");
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
