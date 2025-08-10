import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

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

    await ctx.db.delete(args.appointmentId);
  },
});

// Get appointment statistics
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
