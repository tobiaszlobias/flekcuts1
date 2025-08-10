import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

// Create user role for new users
export const createUserRole = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Check if user already has a role
    const existingRole = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
      .first();

    if (!existingRole) {
      await ctx.db.insert("userRoles", {
        userId: identity.subject,
        role: "user",
        email: identity.email || "unknown@email.com",
      });
    }
  },
});

// Get current user's role
export const getCurrentUserRole = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return null;
    }

    // Check if user has a role assigned
    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
      .first();

    // If no role exists, return null (frontend should call createUserRole mutation)
    return userRole?.role || null;
  },
});

// Check if current user is admin
export const isCurrentUserAdmin = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      return false;
    }

    const userRole = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
      .first();

    return userRole?.role === "admin" || false;
  },
});

// Promote user to admin (only admins can do this)
export const promoteToAdmin = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (identity === null) {
      throw new Error("Not authenticated");
    }

    // Check if current user is admin
    const currentUserRole = await ctx.db
      .query("userRoles")
      .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
      .first();

    if (currentUserRole?.role !== "admin") {
      throw new Error("Only admins can promote users");
    }

    // Find user by email and promote them
    const targetUser = await ctx.db
      .query("userRoles")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();

    if (!targetUser) {
      throw new Error("User not found");
    }

    await ctx.db.patch(targetUser._id, { role: "admin" });
  },
});

// Helper function to check if user is admin (for use in other functions)
export const checkIsAdmin = async (ctx: any) => {
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
