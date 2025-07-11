import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

// Get recent chat messages for a border crossing
export const getMessages = query({
  args: {
    borderCrossingId: v.optional(v.union(v.id("borderCrossings"), v.null())),
    direction: v.optional(v.union(v.literal("ro-bg"), v.literal("bg-ro"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const limit = args.limit || 50;
    
    let messages;
    
    if (args.borderCrossingId && args.borderCrossingId !== null) {
      messages = await ctx.db
        .query("chatMessages")
        .withIndex("by_border_crossing", (q) => 
          q.eq("borderCrossingId", args.borderCrossingId!)
        )
        .order("desc")
        .take(limit);
    } else {
      messages = await ctx.db
        .query("chatMessages")
        .order("desc")
        .take(limit);
    }

    // Filter by direction if specified
    if (args.direction) {
      messages = messages.filter(m => m.direction === args.direction);
    }

    // Get user info for each message
    const messagesWithUsers = await Promise.all(
      messages.map(async (message) => {
        const user = await ctx.db.get(message.userId);
        return {
          ...message,
          user: user ? {
            name: user.name || "Utilizator anonim",
            email: user.email,
          } : null,
        };
      })
    );

    return messagesWithUsers.reverse(); // Return in chronological order
  },
});

// Send a chat message
export const sendMessage = mutation({
  args: {
    message: v.string(),
    borderCrossingId: v.optional(v.id("borderCrossings")),
    direction: v.optional(v.union(v.literal("ro-bg"), v.literal("bg-ro"))),
    messageType: v.optional(v.union(
      v.literal("text"),
      v.literal("status"),
      v.literal("alert")
    )),
    status: v.optional(v.union(
      v.literal("in_queue"),
      v.literal("crossed"),
      v.literal("blocked"),
      v.literal("moving_fast"),
      v.literal("moving_slow"),
      v.literal("how_long")
    )),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to send messages");
    }

    const messageId = await ctx.db.insert("chatMessages", {
      userId,
      borderCrossingId: args.borderCrossingId,
      direction: args.direction,
      message: args.message,
      messageType: args.messageType || "text",
      status: args.status,
      sentAt: Date.now(),
    });

    return messageId;
  },
});

// Send quick status update
export const sendQuickStatus = mutation({
  args: {
    borderCrossingId: v.id("borderCrossings"),
    direction: v.union(v.literal("ro-bg"), v.literal("bg-ro")),
    status: v.union(
      v.literal("in_queue"),
      v.literal("crossed"),
      v.literal("blocked"),
      v.literal("moving_fast"),
      v.literal("moving_slow"),
      v.literal("how_long")
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error("Must be logged in to send status updates");
    }

    const statusMessages = {
      in_queue: "Sunt în coadă",
      crossed: "Am trecut",
      blocked: "Pod blocat",
      moving_fast: "Se mișcă repede",
      moving_slow: "Se mișcă încet",
      how_long: "Cât mai durează?",
    };

    const messageId = await ctx.db.insert("chatMessages", {
      userId,
      borderCrossingId: args.borderCrossingId,
      direction: args.direction,
      message: statusMessages[args.status],
      messageType: "status",
      status: args.status,
      sentAt: Date.now(),
    });

    return messageId;
  },
});
