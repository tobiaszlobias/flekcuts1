export const normalizeEmail = (email: string): string => email.trim().toLowerCase();

export const maskEmail = (email: string): string => {
  const at = email.indexOf("@");
  if (at <= 1) return "***";
  return `${email.slice(0, 1)}***${email.slice(at)}`;
};

export async function requireIdentity(ctx: any) {
  const identity = await ctx.auth.getUserIdentity();
  if (identity === null) {
    throw new Error("Not authenticated");
  }
  return identity;
}

export async function requireAdmin(ctx: any) {
  const identity = await requireIdentity(ctx);

  const userRole = await ctx.db
    .query("userRoles")
    .withIndex("by_user", (q: any) => q.eq("userId", identity.subject))
    .first();

  if (userRole?.role !== "admin") {
    throw new Error("Admin access required");
  }

  return identity;
}

