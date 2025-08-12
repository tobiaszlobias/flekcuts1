import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/clerk-sdk-node";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation } from "./_generated/server";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export const storeUser = httpAction(async (ctx, request) => {
  console.log("🚀 WEBHOOK RECEIVED - Starting processing...");

  if (!webhookSecret) {
    console.error("❌ CLERK_WEBHOOK_SECRET is not set");
    throw new Error("CLERK_WEBHOOK_SECRET is not set");
  }

  const headers = request.headers;
  const payload = await request.text();

  console.log("📋 Headers received:", {
    "svix-id": headers.get("svix-id"),
    "svix-timestamp": headers.get("svix-timestamp"),
    "svix-signature": headers.get("svix-signature") ? "present" : "missing",
  });

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
    console.log("✅ Webhook signature verified successfully");
  } catch (err) {
    console.error("❌ Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const eventType = evt.type;
  console.log(`🔔 Webhook event type: ${eventType}`);
  console.log("📄 Full event data:", JSON.stringify(evt.data, null, 2));

  // Handle user creation (has full user data including email)
  if (eventType === "user.created") {
    console.log("👤 Processing user.created event");
    const eventData = evt.data as any;
    const { id, email_addresses } = eventData;
    const email = email_addresses?.[0]?.email_address;

    console.log("📧 Extracted data:", { id, email, email_addresses });

    if (!id || !email) {
      console.error(`❌ Missing user data - ID: ${id}, Email: ${email}`);
      return new Response("Error: id or email is undefined", {
        status: 400,
      });
    }

    console.log(`👤 Processing user creation for ${id} with email ${email}`);

    try {
      const linkedCount = await ctx.runMutation(
        api.users.linkAnonymousAppointments,
        {
          userId: id,
          email: email,
        }
      );
      console.log(
        `✅ Successfully processed user creation for ${id}, linked ${linkedCount} appointments`
      );
    } catch (error) {
      console.error(`❌ Error processing user creation:`, error);
      // Don't fail the webhook - this is a non-critical operation
    }
  }

  // Handle session creation (for returning users)
  else if (eventType === "session.created") {
    console.log("🔄 Processing session.created event");
    const eventData = evt.data as any;
    console.log("📄 Session event data keys:", Object.keys(eventData));

    const userId = eventData.user_id;
    console.log("👤 Extracted userId from session:", userId);

    if (!userId) {
      console.error(`❌ Missing user_id in session.created event`);
      console.log("📄 Available data:", JSON.stringify(eventData, null, 2));
      return new Response("Error: user_id is undefined", {
        status: 400,
      });
    }

    console.log(`🔄 Processing session creation for user ${userId}`);

    try {
      const linkedCount = await ctx.runMutation(
        api.users.linkAnonymousAppointmentsForExistingUser,
        {
          userId: userId,
        }
      );
      console.log(
        `✅ Successfully processed session creation for ${userId}, linked ${linkedCount} appointments`
      );
    } catch (error) {
      console.error(`❌ Error processing session creation:`, error);
      // Don't fail the webhook - this is a non-critical operation
    }
  }

  // NEW: Also handle user sign-in events
  else if (eventType === "user.updated") {
    console.log("🔄 Processing user.updated event (might be sign-in)");
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
        console.log(
          `🔄 Recent sign-in detected for user ${id} with email ${email}`
        );

        try {
          const linkedCount = await ctx.runMutation(
            api.users.ensureUserAndLinkAppointments,
            {
              userId: id,
              email: email,
            }
          );
          console.log(
            `✅ Successfully processed user sign-in for ${id}, linked ${linkedCount} appointments`
          );
        } catch (error) {
          console.error(`❌ Error processing user sign-in:`, error);
        }
      }
    }
  } else {
    console.log(`ℹ️ Ignoring webhook event type: ${eventType}`);
  }

  console.log("🏁 Webhook processing completed");
  return new Response("User processed", { status: 200 });
});

// Original function for new users (when we have email from webhook)
export const linkAnonymousAppointments = mutation({
  args: { userId: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    console.log(
      `🔗 linkAnonymousAppointments called for user ${args.userId} with email ${args.email}`
    );

    try {
      // Check if the user already exists
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .first();

      if (!existingUser) {
        // Create a new user only if they don't exist
        await ctx.db.insert("users", {
          userId: args.userId,
          email: args.email,
        });
        console.log(`✅ Created new user: ${args.userId}`);
      } else {
        console.log(`👤 User already exists: ${args.userId}`);
      }

      return await linkAppointmentsByEmail(ctx, args.userId, args.email);
    } catch (error) {
      console.error(`❌ Error in linkAnonymousAppointments:`, error);
      throw error;
    }
  },
});

// Function for existing users (when we only have userId from session.created)
export const linkAnonymousAppointmentsForExistingUser = mutation({
  args: { userId: v.string() },
  handler: async (ctx, args) => {
    console.log(
      `🔗 linkAnonymousAppointmentsForExistingUser called for user ${args.userId}`
    );

    try {
      // Look up the user's email from our database
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .first();

      if (!existingUser) {
        console.log(
          `⚠️ User ${args.userId} not found in database, skipping appointment linking`
        );
        return 0;
      }

      console.log(
        `👤 Found existing user: ${args.userId} with email: ${existingUser.email}`
      );

      return await linkAppointmentsByEmail(
        ctx,
        args.userId,
        existingUser.email
      );
    } catch (error) {
      console.error(
        `❌ Error in linkAnonymousAppointmentsForExistingUser:`,
        error
      );
      throw error;
    }
  },
});

// NEW: Combined function that ensures user exists and links appointments
export const ensureUserAndLinkAppointments = mutation({
  args: { userId: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    console.log(
      `🔗 ensureUserAndLinkAppointments called for user ${args.userId} with email ${args.email}`
    );

    try {
      // Check if the user exists, if not create them
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_userId", (q) => q.eq("userId", args.userId))
        .first();

      if (!existingUser) {
        await ctx.db.insert("users", {
          userId: args.userId,
          email: args.email,
        });
        console.log(`✅ Created new user: ${args.userId}`);
      } else {
        console.log(`👤 User already exists: ${args.userId}`);
      }

      return await linkAppointmentsByEmail(ctx, args.userId, args.email);
    } catch (error) {
      console.error(`❌ Error in ensureUserAndLinkAppointments:`, error);
      throw error;
    }
  },
});

// Helper function to link appointments by email
async function linkAppointmentsByEmail(
  ctx: any,
  userId: string,
  email: string
) {
  console.log(`🔍 Searching for anonymous appointments with email: ${email}`);

  // Try exact email match first
  let anonymousAppointments = await ctx.db
    .query("appointments")
    .withIndex("by_email", (q: any) => q.eq("customerEmail", email))
    .filter((q: any) => q.eq(q.field("userId"), "anonymous"))
    .collect();

  // If no exact match, try case-insensitive search
  if (anonymousAppointments.length === 0) {
    console.log(`🔍 No exact match, trying case-insensitive search...`);
    const allAnonymous = await ctx.db
      .query("appointments")
      .filter((q: any) => q.eq(q.field("userId"), "anonymous"))
      .collect();

    anonymousAppointments = allAnonymous.filter(
      (appointment: any) =>
        appointment.customerEmail.toLowerCase() === email.toLowerCase()
    );
  }

  console.log(
    `📊 Found ${anonymousAppointments.length} anonymous appointments for ${email}`
  );

  if (anonymousAppointments.length > 0) {
    console.log(
      "📋 Anonymous appointments found:",
      anonymousAppointments.map((a: any) => ({
        id: a._id,
        customerName: a.customerName,
        customerEmail: a.customerEmail,
        service: a.service,
        date: a.date,
        time: a.time,
      }))
    );

    // Link anonymous appointments to the user
    for (const appointment of anonymousAppointments) {
      console.log(
        `🔗 Linking appointment ${appointment._id} to user ${userId}`
      );
      await ctx.db.patch(appointment._id, { userId: userId });
    }
  }

  console.log(
    `✅ Successfully linked ${anonymousAppointments.length} anonymous appointments to user ${userId}`
  );

  return anonymousAppointments.length;
}
