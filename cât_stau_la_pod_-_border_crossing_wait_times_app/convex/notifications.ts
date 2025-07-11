import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get user's notification settings
export const getUserNotifications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .collect();

    // Get border crossing info for each notification
    const notificationsWithCrossings = await Promise.all(
      notifications.map(async (notification) => {
        const crossing = await ctx.db.get(notification.borderCrossingId);
        return {
          ...notification,
          borderCrossing: crossing,
        };
      })
    );

    return notificationsWithCrossings;
  },
});

// Create or update notification setting
export const setNotification = mutation({
  args: {
    borderCrossingId: v.id("borderCrossings"),
    direction: v.union(v.literal("ro-bg"), v.literal("bg-ro")),
    thresholdMinutes: v.number(),
    isActive: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to set notifications");
    }

    // Check if notification already exists
    const existing = await ctx.db
      .query("notifications")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .filter((q) => 
        q.and(
          q.eq(q.field("borderCrossingId"), args.borderCrossingId),
          q.eq(q.field("direction"), args.direction)
        )
      )
      .unique();

    if (existing) {
      // Update existing notification
      await ctx.db.patch(existing._id, {
        thresholdMinutes: args.thresholdMinutes,
        isActive: args.isActive,
      });
      return existing._id;
    } else {
      // Create new notification
      const notificationId = await ctx.db.insert("notifications", {
        userId,
        borderCrossingId: args.borderCrossingId,
        direction: args.direction,
        thresholdMinutes: args.thresholdMinutes,
        isActive: args.isActive,
      });
      return notificationId;
    }
  },
});

// Remove notification
export const removeNotification = mutation({
  args: {
    notificationId: v.id("notifications"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to remove notifications");
    }

    const notification = await ctx.db.get(args.notificationId);
    if (!notification || notification.userId !== userId) {
      throw new Error("Notification not found or not owned by user");
    }

    await ctx.db.delete(args.notificationId);
  },
});
