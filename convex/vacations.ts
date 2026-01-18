import { query } from "./_generated/server";
import { v } from "convex/values";

export const getVacationsByRange = query({
  args: {
    startDate: v.string(), // YYYY-MM-DD
    endDate: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    // Get vacations that overlap the range: startDate <= rangeEnd AND endDate >= rangeStart
    return await ctx.db
      .query("vacations")
      .withIndex("by_startDate", (q) => q.lte("startDate", args.endDate))
      .filter((q) => q.gte(q.field("endDate"), args.startDate))
      .collect();
  },
});

