import {
  internalAction,
  internalMutation,
  internalQuery,
} from "./_generated/server";
import { v } from "convex/values";
import { internal } from "./_generated/api";
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

interface GoSmsTokenResponse {
  access_token?: string;
  expires_in?: number;
  token_type?: string;
}

interface GoSmsSendResponse {
  link?: string;
  message?: string;
  error?: string;
  error_description?: string;
  recipients?: {
    invalid?: string[];
  };
}

interface SmsResult {
  success: boolean;
  message: string;
  link?: string;
}

const GOSMS_TOKEN_URL = "https://app.gosms.eu/oauth/v2/token";
const GOSMS_MESSAGES_URL = "https://app.gosms.eu/api/v1/messages";
const SMS_MAX_LENGTH = 160;

const formatDateForSms = (dateIso: string): string => {
  const [year, month, day] = dateIso.split("-");
  if (!year || !month || !day) return dateIso;
  return `${day}.${month}.${year}`;
};

const toAsciiSms = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\x20-\x7E]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const truncateWithDots = (value: string, maxLength: number): string => {
  if (value.length <= maxLength) return value;
  if (maxLength <= 3) return value.slice(0, maxLength);
  return `${value.slice(0, maxLength - 3)}...`;
};

const buildAppointmentConfirmationSms = (appointment: {
  date: string;
  time: string;
  service: string;
}) => {
  const dateText = toAsciiSms(formatDateForSms(appointment.date));
  const timeText = toAsciiSms(appointment.time);
  const prefix = `FlekCuts: Objednavka potvrzena ${dateText} ${timeText}. Sluzba: `;
  const suffix = `. Uprava: flekcuts.cz`;
  const maxServiceLength = Math.max(0, SMS_MAX_LENGTH - prefix.length - suffix.length);
  const serviceText = truncateWithDots(toAsciiSms(appointment.service), maxServiceLength);
  const message = `${prefix}${serviceText}${suffix}`;
  return truncateWithDots(message, SMS_MAX_LENGTH);
};

const parseResponseJson = async <T>(response: Response): Promise<T | null> => {
  const raw = await response.text();
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
};

const getGoSmsAccessToken = async (): Promise<string> => {
  const clientId = process.env.GOSMS_CLIENT_ID;
  const clientSecret = process.env.GOSMS_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error("Missing GOSMS_CLIENT_ID or GOSMS_CLIENT_SECRET");
  }

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const tokenResponse = await fetch(GOSMS_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: body.toString(),
  });

  const tokenJson = await parseResponseJson<GoSmsTokenResponse & GoSmsSendResponse>(tokenResponse);
  if (!tokenResponse.ok || !tokenJson?.access_token) {
    const detail = tokenJson?.error_description || tokenJson?.message || tokenJson?.error;
    throw new Error(
      `GoSMS token request failed (${tokenResponse.status})${detail ? `: ${detail}` : ""}`,
    );
  }

  return tokenJson.access_token;
};

export const sendAppointmentConfirmationSms = internalAction({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args): Promise<SmsResult> => {
    const rawChannelId = process.env.GOSMS_CHANNEL_ID;
    const channelId = rawChannelId ? Number(rawChannelId) : NaN;
    if (!Number.isFinite(channelId)) {
      throw new Error("Missing or invalid GOSMS_CHANNEL_ID");
    }

    const appointment = await ctx.runQuery(internal.notifications.getById, {
      id: args.appointmentId,
    });
    if (!appointment) {
      throw new Error("Appointment not found");
    }
    if (!appointment.customerPhone) {
      throw new Error("Missing customerPhone on appointment");
    }

    const accessToken = await getGoSmsAccessToken();
    const smsMessage = buildAppointmentConfirmationSms({
      date: appointment.date,
      time: appointment.time,
      service: appointment.service,
    });

    const smsResponse = await fetch(GOSMS_MESSAGES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        message: smsMessage,
        recipients: [appointment.customerPhone],
        channel: Math.floor(channelId),
      }),
    });

    const smsJson = await parseResponseJson<GoSmsSendResponse>(smsResponse);
    if (!smsResponse.ok) {
      const detail = smsJson?.error_description || smsJson?.message || smsJson?.error;
      throw new Error(
        `GoSMS send failed (${smsResponse.status})${detail ? `: ${detail}` : ""}`,
      );
    }

    if (smsJson?.recipients?.invalid?.length) {
      throw new Error(`GoSMS rejected recipient: ${smsJson.recipients.invalid.join(", ")}`);
    }

    console.log("✅ Confirmation SMS sent", {
      appointmentId: args.appointmentId,
      recipientPhone: appointment.customerPhone,
      link: smsJson?.link,
    });

    return {
      success: true,
      message: "Confirmation SMS sent",
      link: smsJson?.link,
    };
  },
});

// Send appointment confirmation email
export const sendAppointmentConfirmation = internalAction({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args): Promise<EmailResult> => {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) {
      throw new Error("RESEND_API_KEY environment variable is not set");
    }

    const appointment = await ctx.runQuery(internal.notifications.getById, {
      id: args.appointmentId,
    });

    if (!appointment) {
      throw new Error("Appointment not found");
    }

    if (!appointment.customerEmail) {
      throw new Error("Missing customerEmail on appointment");
    }

    const emailData = {
      customerName: appointment.customerName,
      customerEmail: appointment.customerEmail,
      service: appointment.service,
      date: appointment.date,
      time: appointment.time,
    };

    const emailContent = emailTemplates.appointmentConfirmation(emailData);

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
      throw new Error(
        emailResult.message || emailResult.name || "Email send failed",
      );
    }

    await ctx.runMutation(internal.notifications.logEmailSent, {
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
  },
});

const FROM_EMAIL = "FlekCuts <noreply@flekcuts.cz>";
export const sendAppointmentReminder = internalAction({
  args: {
    appointmentId: v.id("appointments"),
  },
  handler: async (ctx, args): Promise<EmailResult> => {
    const appointment = await ctx.runQuery(internal.notifications.getById, {
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

      console.log("✅ Reminder email sent", {
        appointmentId: args.appointmentId,
        resendId: emailResult.id,
      });

      await ctx.runMutation(internal.notifications.logEmailSent, {
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

      await ctx.runMutation(internal.notifications.logEmailSent, {
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
export const sendStatusUpdate = internalAction({
  args: {
    appointmentId: v.id("appointments"),
    newStatus: v.union(
      v.literal("pending"),
      v.literal("confirmed"),
      v.literal("cancelled"),
    ),
  },
  handler: async (ctx, args): Promise<EmailResult> => {
    const appointment = await ctx.runQuery(internal.notifications.getById, {
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

      console.log("✅ Status update email sent", {
        appointmentId: args.appointmentId,
        resendId: emailResult.id,
      });

      await ctx.runMutation(internal.notifications.logEmailSent, {
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

      await ctx.runMutation(internal.notifications.logEmailSent, {
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
export const getById = internalQuery({
  args: { id: v.id("appointments") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Log email sending attempts
export const logEmailSent = internalMutation({
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

// Check appointments that need reminders (for scheduled function)
export const getAppointmentsNeedingReminders = internalQuery({
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

export const sendDailyReminders = internalAction({
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
      internal.notifications.getAppointmentsNeedingReminders,
    );

    console.log(
      `Found ${appointmentsNeedingReminders.length} appointments needing reminders`,
    );

    let successCount = 0;
    let failureCount = 0;

    // Send reminder for each appointment
    for (const appointment of appointmentsNeedingReminders) {
      try {
        await ctx.runAction(internal.notifications.sendAppointmentReminder, {
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
