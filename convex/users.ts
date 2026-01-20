import { httpAction, internalMutation } from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/clerk-sdk-node";
import { v } from "convex/values";
import { internal } from "./_generated/api";
import { maskEmail, normalizeEmail } from "./authz";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export const storeUser = httpAction(async (ctx, request) => {
  const debug = process.env.WEBHOOK_DEBUG_LOGS === "true";
  if (debug) console.log("🚀 Clerk webhook received");

  if (!webhookSecret) {
    console.error("❌ CLERK_WEBHOOK_SECRET is not set");
    throw new Error("CLERK_WEBHOOK_SECRET is not set");
  }

  const headers = request.headers;
  const payload = await request.text();

  if (debug) {
    console.log("📋 Svix headers present:", {
      "svix-id": !!headers.get("svix-id"),
      "svix-timestamp": !!headers.get("svix-timestamp"),
      "svix-signature": !!headers.get("svix-signature"),
    });
  }

  const svix_id = headers.get("svix-id");
  const svix_timestamp = headers.get("svix-timestamp");
  const svix_signature = headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    console.error("❌ Missing svix headers");
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  const wh = new Webhook(webhookSecret);
  let evt: WebhookEvent;

  try {
    evt = wh.verify(payload, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
    if (debug) console.log("✅ Webhook signature verified");
  } catch (err) {
    console.error("❌ Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const eventType = evt.type;
  if (debug) console.log(`🔔 Webhook event type: ${eventType}`);

  // Handle user creation (has full user data including email)
  if (eventType === "user.created") {
    const eventData = evt.data as any;
    const { id, email_addresses } = eventData;
    const email = email_addresses?.[0]?.email_address;

    if (debug) console.log("📧 user.created extracted:", { userId: id, email: email ? maskEmail(email) : null });

    if (!id || !email) {
      console.error(`❌ Missing user data - ID: ${id}, Email: ${email}`);
      return new Response("Error: id or email is undefined", {
        status: 400,
      });
    }

    try {
      const linkedCount = await ctx.runMutation(internal.users.linkAnonymousAppointmentsFromWebhook, {
        userId: id,
        email,
      });
      if (debug) console.log(`✅ user.created linked appointments: ${linkedCount}`);
    } catch (error) {
      console.error(`❌ Error processing user creation:`, error);
      // Don't fail the webhook - this is a non-critical operation
    }
  }

  // Handle session creation (for returning users)
  else if (eventType === "session.created") {
    const eventData = evt.data as any;
    const userId = eventData.user_id;
    if (debug) console.log("👤 session.created extracted userId:", userId);

    if (!userId) {
      console.error(`❌ Missing user_id in session.created event`);
      return new Response("Error: user_id is undefined", {
        status: 400,
      });
    }

    try {
      const linkedCount = await ctx.runMutation(
        internal.users.linkAnonymousAppointmentsForExistingUserFromWebhook,
        {
          userId: userId,
        }
      );
      if (debug) console.log(`✅ session.created linked appointments: ${linkedCount}`);
    } catch (error) {
      console.error(`❌ Error processing session creation:`, error);
      // Don't fail the webhook - this is a non-critical operation
    }
  }

  // NEW: Also handle user sign-in events
  else if (eventType === "user.updated") {
    const eventData = evt.data as any;
    const { id, email_addresses, last_sign_in_at } = eventData;
    const email = email_addresses?.[0]?.email_address;

    // Check if this is a recent sign-in (user.updated can happen for various reasons)
    if (last_sign_in_at && id && email) {
      const signInTime = new Date(last_sign_in_at);
      const now = new Date();
      const timeDiff = now.getTime() - signInTime.getTime();

      // If sign-in was within the last 30 seconds, try to link appointments
      if (timeDiff < 30000) {
        if (debug) console.log(`🔄 Recent sign-in detected: ${id} ${email ? maskEmail(email) : ""}`);

        try {
          const linkedCount = await ctx.runMutation(
            internal.users.ensureUserAndLinkAppointmentsFromWebhook,
            {
              userId: id,
              email: email,
            }
          );
          if (debug) console.log(`✅ user.updated linked appointments: ${linkedCount}`);
        } catch (error) {
          console.error(`❌ Error processing user sign-in:`, error);
        }
      }
    }
  } else {
    if (debug) console.log(`ℹ️ Ignoring webhook event type: ${eventType}`);
  }

  if (debug) console.log("🏁 Webhook processing completed");
  return new Response("User processed", { status: 200 });
});

export const linkAnonymousAppointmentsFromWebhook = internalMutation({
  args: { userId: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const userId = args.userId.trim();
    const email = normalizeEmail(args.email);
    if (!userId || !email) return 0;

    // Check if the user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!existingUser) {
      await ctx.db.insert("users", { userId, email });
    }

    return await linkAppointmentsByEmail(ctx, userId, email);
  },
});

export const linkAnonymousAppointmentsForExistingUserFromWebhook = internalMutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    const userId = args.userId.trim();
    if (!userId) return 0;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!existingUser) return 0;
    return await linkAppointmentsByEmail(ctx, userId, existingUser.email);
  },
});

export const ensureUserAndLinkAppointmentsFromWebhook = internalMutation({
  args: { userId: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const userId = args.userId.trim();
    const email = normalizeEmail(args.email);
    if (!userId || !email) return 0;

    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", userId))
      .first();

    if (!existingUser) {
      await ctx.db.insert("users", { userId, email });
    }

    return await linkAppointmentsByEmail(ctx, userId, email);
  },
});

// Helper function to link appointments by email
async function linkAppointmentsByEmail(
  ctx: any,
  userId: string,
  email: string
) {
  const maxLink = (() => {
    const raw = process.env.LINK_MAX_APPOINTMENTS;
    const parsed = raw ? Number(raw) : 50;
    return Number.isFinite(parsed) && parsed > 0 ? Math.min(200, Math.floor(parsed)) : 50;
  })();

  const anonymousAppointments = await ctx.db
    .query("appointments")
    .withIndex("by_email", (q: any) => q.eq("customerEmail", email))
    .filter((q: any) => q.eq(q.field("userId"), "anonymous"))
    .take(maxLink);

  if (anonymousAppointments.length > 0) {
    // Link anonymous appointments to the user
    for (const appointment of anonymousAppointments) {
      await ctx.db.patch(appointment._id, { userId: userId });
    }
  }

  return anonymousAppointments.length;
}
