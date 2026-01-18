import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";

const SLOT_MINUTES = 15;

const parseTimeToMinutes = (time: string): number => {
  const [hoursStr, minutesStr = "0"] = time.split(":");
  const hours = Number(hoursStr);
  const minutes = Number(minutesStr);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
  return hours * 60 + minutes;
};

const roundUpToSlotMinutes = (durationMinutes: number): number => {
  if (!Number.isFinite(durationMinutes) || durationMinutes <= 0) return SLOT_MINUTES;
  return Math.ceil(durationMinutes / SLOT_MINUTES) * SLOT_MINUTES;
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

  // Combos (generated on the frontend)
  const hasBeard = normalized.includes("+ Vousy");
  const hasWash = normalized.includes("+ Mytí vlasů");

  let base: number | null = null;
  if (normalized.startsWith("Fade")) base = 45;
  if (normalized.startsWith("Klasický střih")) base = 30;

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
    durationMinutes: v.optional(v.number()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    const newStart = parseTimeToMinutes(args.time);
    if (!Number.isFinite(newStart)) {
      throw new Error("Invalid time format.");
    }

    const derivedDuration = deriveServiceDurationMinutes(args.service);
    const newDuration = roundUpToSlotMinutes(args.durationMinutes ?? derivedDuration);
    const newEnd = newStart + newDuration;

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
      const existingDuration = roundUpToSlotMinutes(existingDerived);
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
    const newStart = parseTimeToMinutes(args.time);
    if (!Number.isFinite(newStart)) {
      throw new Error("Invalid time format.");
    }

    const derivedDuration = deriveServiceDurationMinutes(args.service);
    const newDuration = roundUpToSlotMinutes(args.durationMinutes ?? derivedDuration);
    const newEnd = newStart + newDuration;

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
      const existingDuration = roundUpToSlotMinutes(existingDerived);
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
