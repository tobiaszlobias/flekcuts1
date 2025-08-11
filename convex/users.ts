import { httpAction } from "./_generated/server";
import { Webhook } from "svix";
import { WebhookEvent } from "@clerk/clerk-sdk-node";
import { v } from "convex/values";
import { api } from "./_generated/api";
import { mutation } from "./_generated/server";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

export const storeUser = httpAction(async (ctx, request) => {
  if (!webhookSecret) {
    throw new Error("CLERK_WEBHOOK_SECRET is not set");
  }

  const headers = request.headers;
  const payload = await request.text();

  const svix_id = headers.get("svix-id");
  const svix_timestamp = headers.get("svix-timestamp");
  const svix_signature = headers.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
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
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  const eventType = evt.type;

  if (eventType === "user.created") {
    const { id, email_addresses } = evt.data;
    const email = email_addresses[0].email_address;

    if (!id) {
      return new Response("Error: id is undefined", {
        status: 400,
      });
    }

    await ctx.runMutation(api.users.linkAnonymousAppointments, { userId: id, email });
  }

  return new Response("User stored", { status: 200 });
});

export const linkAnonymousAppointments = mutation({
  args: { userId: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    // Check if the user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .first();

    if (existingUser) {
      return;
    }

    // Create a new user
    await ctx.db.insert("users", {
      userId: args.userId,
      email: args.email,
    });

    // Find anonymous appointments with the same email
    const anonymousAppointments = await ctx.db
      .query("appointments")
      .withIndex("by_email", (q) => q.eq("customerEmail", args.email))
      .filter((q) => q.eq(q.field("userId"), "anonymous"))
      .collect();

    // Link anonymous appointments to the new user
    for (const appointment of anonymousAppointments) {
      await ctx.db.patch(appointment._id, { userId: args.userId });
    }
  },
});