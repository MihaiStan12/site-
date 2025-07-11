import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get all active border crossings
export const list = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query("borderCrossings")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

// Get current wait times for all border crossings
export const getCurrentWaitTimes = query({
  args: {},
  handler: async (ctx) => {
    const borderCrossings = await ctx.db
      .query("borderCrossings")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;

    const waitTimes = await Promise.all(
      borderCrossings.map(async (crossing) => {
        // Get recent reports for both directions
        const recentReports = await ctx.db
          .query("waitTimeReports")
          .withIndex("by_border_crossing", (q) => q.eq("borderCrossingId", crossing._id))
          .filter((q) => 
            q.and(
              q.gte(q.field("reportedAt"), oneHourAgo),
              q.neq(q.field("status"), "invalidated")
            )
          )
          .collect();

        // Calculate average wait times by direction
        const roBgReports = recentReports.filter(r => r.direction === "ro-bg");
        const bgRoReports = recentReports.filter(r => r.direction === "bg-ro");

        const calculateAverage = (reports: typeof recentReports) => {
          if (reports.length === 0) return null;
          const weightedSum = reports.reduce((sum, report) => {
            const weight = report.trustScore;
            return sum + (report.waitTimeMinutes * weight);
          }, 0);
          const totalWeight = reports.reduce((sum, report) => sum + report.trustScore, 0);
          return Math.round(weightedSum / totalWeight);
        };

        return {
          ...crossing,
          waitTimes: {
            "ro-bg": calculateAverage(roBgReports),
            "bg-ro": calculateAverage(bgRoReports),
          },
          reportCount: recentReports.length,
          lastUpdated: recentReports.length > 0 
            ? Math.max(...recentReports.map(r => r.reportedAt))
            : null,
        };
      })
    );

    return waitTimes;
  },
});

// Get wait time history for a specific border crossing
export const getWaitTimeHistory = query({
  args: {
    borderCrossingId: v.id("borderCrossings"),
    direction: v.union(v.literal("ro-bg"), v.literal("bg-ro")),
    hours: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hours = args.hours || 24;
    const since = Date.now() - (hours * 60 * 60 * 1000);

    const reports = await ctx.db
      .query("waitTimeReports")
      .withIndex("by_border_and_direction", (q) => 
        q.eq("borderCrossingId", args.borderCrossingId).eq("direction", args.direction)
      )
      .filter((q) => 
        q.and(
          q.gte(q.field("reportedAt"), since),
          q.neq(q.field("status"), "invalidated")
        )
      )
      .order("desc")
      .collect();

    return reports.map(report => ({
      waitTimeMinutes: report.waitTimeMinutes,
      reportedAt: report.reportedAt,
      trustScore: report.trustScore,
      vehicleType: report.vehicleType,
    }));
  },
});

// Report wait time
export const reportWaitTime = mutation({
  args: {
    borderCrossingId: v.id("borderCrossings"),
    direction: v.union(v.literal("ro-bg"), v.literal("bg-ro")),
    waitTimeMinutes: v.number(),
    vehicleType: v.union(
      v.literal("car"),
      v.literal("truck"),
      v.literal("bus"),
      v.literal("motorcycle")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to report wait times");
    }

    // Get or create user stats
    let userStats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .unique();

    if (!userStats) {
      const userStatsId = await ctx.db.insert("userStats", {
        userId,
        totalReports: 0,
        verifiedReports: 0,
        invalidatedReports: 0,
        trustScore: 1.0,
      });
      userStats = await ctx.db.get(userStatsId);
    }

    // Calculate initial trust score based on user history
    const baseTrustScore = Math.min(userStats!.trustScore, 1.0);

    // Create the report
    const reportId = await ctx.db.insert("waitTimeReports", {
      borderCrossingId: args.borderCrossingId,
      userId,
      direction: args.direction,
      waitTimeMinutes: args.waitTimeMinutes,
      reportedAt: Date.now(),
      vehicleType: args.vehicleType,
      trustScore: baseTrustScore,
      status: "pending",
    });

    // Update user stats
    await ctx.db.patch(userStats!._id, {
      totalReports: userStats!.totalReports + 1,
      lastReportAt: Date.now(),
    });

    return reportId;
  },
});

// Verify or invalidate a report
export const verifyReport = mutation({
  args: {
    reportId: v.id("waitTimeReports"),
    isValid: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to verify reports");
    }

    const report = await ctx.db.get(args.reportId);
    if (!report) {
      throw new Error("Report not found");
    }

    // Don't allow users to verify their own reports
    if (report.userId === userId) {
      throw new Error("Cannot verify your own report");
    }

    const verifiedBy = report.verifiedBy || [];
    const invalidatedBy = report.invalidatedBy || [];

    if (args.isValid) {
      if (!verifiedBy.includes(userId)) {
        verifiedBy.push(userId);
      }
      // Remove from invalidated if present
      const invalidatedIndex = invalidatedBy.indexOf(userId);
      if (invalidatedIndex > -1) {
        invalidatedBy.splice(invalidatedIndex, 1);
      }
    } else {
      if (!invalidatedBy.includes(userId)) {
        invalidatedBy.push(userId);
      }
      // Remove from verified if present
      const verifiedIndex = verifiedBy.indexOf(userId);
      if (verifiedIndex > -1) {
        verifiedBy.splice(verifiedIndex, 1);
      }
    }

    // Determine new status
    let newStatus: "pending" | "verified" | "invalidated" = "pending";
    if (verifiedBy.length >= 2) {
      newStatus = "verified";
    } else if (invalidatedBy.length >= 2) {
      newStatus = "invalidated";
    }

    await ctx.db.patch(args.reportId, {
      verifiedBy,
      invalidatedBy,
      status: newStatus,
    });

    return newStatus;
  },
});
