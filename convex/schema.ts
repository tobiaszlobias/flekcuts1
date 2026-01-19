// convex/schema.ts - Updated to support anonymous bookings

import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  appointments: defineTable({
    userId: v.string(), // Keep as string but use "anonymous" for anonymous bookings
    customerName: v.string(),
    customerEmail: v.string(),
    customerPhone: v.optional(v.string()), // Required for anonymous, optional for authenticated
    service: v.string(),
    date: v.string(),
    time: v.string(),
    appointmentStartMs: v.optional(v.number()), // UTC epoch ms for Prague local date+time
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
    .index("by_date", ["date"])
    // Add index for querying by email (useful for anonymous bookings)
    .index("by_email", ["customerEmail"])
    // Add index for querying by date and time
    .index("by_date_time", ["date", "time"])
    // For retention cleanup
    .index("by_startMs", ["appointmentStartMs"]),

  vacations: defineTable({
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(), // YYYY-MM-DD
    startTime: v.optional(v.string()), // HH:MM (optional)
    endTime: v.optional(v.string()), // HH:MM (optional)
    note: v.optional(v.string()),
    createdAt: v.string(), // ISO string
  })
    .index("by_startDate", ["startDate"])
    .index("by_endDate", ["endDate"]),

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

  users: defineTable({
    userId: v.string(),
    email: v.string(),
  })
    .index("by_userId", ["userId"])
    .index("by_email", ["email"]),
});
