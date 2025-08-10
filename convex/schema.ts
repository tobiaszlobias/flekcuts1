// convex/schema.ts - Updated with required indexes

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  appointments: defineTable({
    userId: v.string(),
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()),
    service: v.string(),
    date: v.string(),
    time: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled")
    ),
    notes: v.optional(v.string()),
  })
    // Add index for querying appointments by userId
    .index("by_user", ["userId"])
    // Add index for querying by status
    .index("by_status", ["status"])
    // Add index for querying by date
    .index("by_date", ["date"]),

  userRoles: defineTable({
    userId: v.string(),
    role: v.union(v.literal("user"), v.literal("admin")),
    email: v.string(),
  })
    // Add index for querying user roles by userId
    .index("by_user", ["userId"])
    // Add index for querying by email
    .index("by_email", ["email"]),

  emailLogs: defineTable({
    appointmentId: v.id("appointments"),
    emailType: v.string(), // "confirmation", "reminder", "status_update", "cancellation"
    recipientEmail: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
    sentAt: v.string(), // ISO string
  })
    // Add index for querying email logs by appointment
    .index("by_appointment", ["appointmentId"])
    // Add index for querying by email type
    .index("by_type", ["emailType"])
    // Add index for querying by status
    .index("by_status", ["status"]),
});
