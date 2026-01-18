import { mutation, query, action } from "./_generated/server";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { emailTemplates } from "./emails";

// Types for email responses
interface ResendResponse {
  id?: string;
  message?: string;
  name?: string;
}

interface EmailResult {
  success: boolean;
  message: string;
  emailId?: string;
}

// Send appointment confirmation email
export const sendAppointmentConfirmation = action({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args): Promise<EmailResult> => {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    // Get appointment details
    const appointment = await ctx.runQuery(api.notifications.getById, {
      id: args.appointmentId,
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Prepare email data
    const emailData = {
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
    };

    // Generate email content
    const emailContent = emailTemplates.appointmentConfirmation(emailData);

    try {
      // Send email via Resend
      const response: Response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL, // Use resend.dev for testing
          to: [appointment.customerEmail],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        }),
      });

      const emailResult: ResendResponse = await response.json();

      if (!response.ok) {
        console.error(
          "❌ Email send failed. Status:",
          response.status,
          "Error:",
          emailResult.message || emailResult.name,
        );
        throw new Error(
          `Email sending failed: ${emailResult.message || emailResult.name || "Unknown error"}`,
        );
      }

      // Console logging for development (keep this!)
      console.log("✅ REAL EMAIL SENT:");
      console.log("To:", appointment.customerEmail);
      console.log("Subject:", emailContent.subject);
      console.log("Resend ID:", emailResult.id);
      console.log("Template: confirmation");

      // Log the email send
      await ctx.runMutation(api.notifications.logEmailSent, {
        appointmentId: args.appointmentId,
        emailType: "confirmation",
        recipientEmail: appointment.customerEmail,
        status: "sent",
      });

      return {
        success: true,
        message: "Confirmation email sent",
        emailId: emailResult.id,
      };
    } catch (error) {
      console.error("Failed to send confirmation email:", error);

      // Log the failure
      await ctx.runMutation(api.notifications.logEmailSent, {
        appointmentId: args.appointmentId,
        emailType: "confirmation",
        recipientEmail: appointment.customerEmail,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      throw new Error("Failed to send confirmation email");
    }
  },
});
const FROM_EMAIL = "FlekCuts <noreply@flekcuts.cz>";
// Keep all your other functions exactly the same...
export const sendAppointmentReminder = action({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args): Promise<EmailResult> => {
    const appointment = await ctx.runQuery(api.notifications.getById, {
      id: args.appointmentId,
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    const emailData = {
      customerName: appointment.customerName,
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
    };

    const emailContent = emailTemplates.appointmentReminder(emailData);

    try {
      // Send email via Resend
      const response: Response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [appointment.customerEmail],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        }),
      });

      const emailResult: ResendResponse = await response.json();

      if (!response.ok) {
        throw new Error(`Email sending failed: ${emailResult.message}`);
      }

      console.log("✅ REMINDER EMAIL SENT:");
      console.log("To:", appointment.customerEmail);
      console.log("Subject:", emailContent.subject);
      console.log("Resend ID:", emailResult.id);

      await ctx.runMutation(api.notifications.logEmailSent, {
        appointmentId: args.appointmentId,
        emailType: "reminder",
        recipientEmail: appointment.customerEmail,
        status: "sent",
      });

      return {
        success: true,
        message: "Reminder email sent",
        emailId: emailResult.id,
      };
    } catch (error) {
      console.error("Failed to send reminder email:", error);

      await ctx.runMutation(api.notifications.logEmailSent, {
        appointmentId: args.appointmentId,
        emailType: "reminder",
        recipientEmail: appointment.customerEmail,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      throw new Error("Failed to send reminder email");
    }
  },
});

// Rest of your functions remain the same...
export const sendStatusUpdate = action({
  args: {
    appointmentId: v.id("appointments"),
    newStatus: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args): Promise<EmailResult> => {
    const appointment = await ctx.runQuery(api.notifications.getById, {
      id: args.appointmentId,
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    // Get status message in Czech
    const getStatusMessage = (status: string): string => {
      switch (status) {
        case "confirmed":
          return "Objednávka potvrzena";
        case "cancelled":
          return "Objednávka zrušena";
        case "pending":
          return "Objednávka čeká na potvrzení";
        default:
          return "Stav objednávky aktualizován";
      }
    };

    const emailData = {
      customerName: appointment.customerName,
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
      newStatus: args.newStatus,
      statusMessage: getStatusMessage(args.newStatus),
    };

    const emailContent = emailTemplates.statusUpdate(emailData);

    try {
      // Send email via Resend
      const response: Response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: FROM_EMAIL,
          to: [appointment.customerEmail],
          subject: emailContent.subject,
          html: emailContent.html,
          text: emailContent.text,
        }),
      });

      const emailResult: ResendResponse = await response.json();

      if (!response.ok) {
        throw new Error(`Email sending failed: ${emailResult.message}`);
      }

      console.log("✅ STATUS UPDATE EMAIL SENT:");
      console.log("To:", appointment.customerEmail);
      console.log("Subject:", emailContent.subject);
      console.log("Resend ID:", emailResult.id);

      await ctx.runMutation(api.notifications.logEmailSent, {
        appointmentId: args.appointmentId,
        emailType: "status_update",
        recipientEmail: appointment.customerEmail,
        status: "sent",
      });

      return {
        success: true,
        message: "Status update email sent",
        emailId: emailResult.id,
      };
    } catch (error) {
      console.error("Failed to send status update email:", error);

      await ctx.runMutation(api.notifications.logEmailSent, {
        appointmentId: args.appointmentId,
        emailType: "status_update",
        recipientEmail: appointment.customerEmail,
        status: "failed",
        errorMessage: error instanceof Error ? error.message : "Unknown error",
      });

      throw new Error("Failed to send status update email");
    }
  },
});

// Get appointment by ID (helper query)
export const getById = query({
  args: { id: v.id("appointments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Log email sending attempts
export const logEmailSent = mutation({
  args: {
    appointmentId: v.id("appointments"),
    emailType: v.string(),
    recipientEmail: v.string(),
    status: v.union(v.literal("sent"), v.literal("failed")),
    errorMessage: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("emailLogs", {
      appointmentId: args.appointmentId,
      emailType: args.emailType,
      recipientEmail: args.recipientEmail,
      status: args.status,
      errorMessage: args.errorMessage,
      sentAt: new Date().toISOString(),
    });
  },
});

// Get email logs for an appointment
export const getEmailLogs = query({
  args: { appointmentId: v.id("appointments") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("emailLogs")
      .withIndex("by_appointment", (q) =>
        q.eq("appointmentId", args.appointmentId),
      )
      .order("desc")
      .collect();
  },
});

// Check appointments that need reminders (for scheduled function)
export const getAppointmentsNeedingReminders = query({
  args: {},
  handler: async (ctx) => {
    // Get all confirmed appointments
    const appointments = await ctx.db
      .query("appointments")
      .withIndex("by_status", (q) => q.eq("status", "confirmed"))
      .collect();

    // Filter appointments that are 24 hours away
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowDate = tomorrow.toISOString().split("T")[0];

    const appointmentsForTomorrow = appointments.filter(
      (apt) => apt.date === tomorrowDate,
    );

    // Check which ones haven't received reminder emails yet
    const appointmentsNeedingReminders = [];

    for (const appointment of appointmentsForTomorrow) {
      const emailLogs = await ctx.db
        .query("emailLogs")
        .withIndex("by_appointment", (q) =>
          q.eq("appointmentId", appointment._id),
        )
        .filter((q) => q.eq(q.field("emailType"), "reminder"))
        .filter((q) => q.eq(q.field("status"), "sent"))
        .collect();

      if (emailLogs.length === 0) {
        appointmentsNeedingReminders.push(appointment);
      }
    }

    return appointmentsNeedingReminders;
  },
});

// Scheduled function to send daily reminders
export const sendDailyReminders = action({
  args: {},
  handler: async (
    ctx,
  ): Promise<{
    totalChecked: number;
    successCount: number;
    failureCount: number;
    message: string;
  }> => {
    const appointmentsNeedingReminders = await ctx.runQuery(
      api.notifications.getAppointmentsNeedingReminders,
    );

    console.log(
      `Found ${appointmentsNeedingReminders.length} appointments needing reminders`,
    );

    let successCount = 0;
    let failureCount = 0;

    // Send reminder for each appointment
    for (const appointment of appointmentsNeedingReminders) {
      try {
        await ctx.runAction(api.notifications.sendAppointmentReminder, {
          appointmentId: appointment._id,
        });
        successCount++;
        console.log(`Reminder sent for appointment ${appointment._id}`);
      } catch (error) {
        failureCount++;
        console.error(`Failed to send reminder for ${appointment._id}:`, error);
      }
    }

    return {
      totalChecked: appointmentsNeedingReminders.length,
      successCount,
      failureCount,
      message: `Daily reminders complete: ${successCount} sent, ${failureCount} failed`,
    };
  },
});

// Get all email logs (admin only)
export const getAllEmailLogs = query({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    return await ctx.db.query("emailLogs").order("desc").take(limit);
  },
});

// Get email statistics
export const getEmailStats = query({
  args: {},
  handler: async (ctx) => {
    const logs = await ctx.db.query("emailLogs").collect();

    const stats = {
      total: logs.length,
      sent: logs.filter((log) => log.status === "sent").length,
      failed: logs.filter((log) => log.status === "failed").length,
      byType: {
        confirmation: logs.filter((log) => log.emailType === "confirmation")
          .length,
        reminder: logs.filter((log) => log.emailType === "reminder").length,
        status_update: logs.filter((log) => log.emailType === "status_update")
          .length,
      },
      recent: logs.filter((log) => {
        const logDate = new Date(log.sentAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return logDate >= weekAgo;
      }).length,
    };

    return stats;
  },
});
