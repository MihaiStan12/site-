import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  // Border Crossings
  borderCrossings: defineTable({
    name: v.string(),
    nameRo: v.string(),
    location: v.object({
      lat: v.number(),
      lng: v.number(),
    }),
    countries: v.array(v.string()),
    isActive: v.boolean(),
  }),

  // Wait Time Reports
  waitTimeReports: defineTable({
    borderCrossingId: v.id("borderCrossings"),
    userId: v.id("users"),
    direction: v.union(v.literal("ro-bg"), v.literal("bg-ro")),
    waitTimeMinutes: v.number(),
    reportedAt: v.number(),
    vehicleType: v.union(
      v.literal("car"),
      v.literal("truck"),
      v.literal("bus"),
      v.literal("motorcycle")
    ),
    trustScore: v.number(),
    status: v.union(
      v.literal("pending"),
      v.literal("verified"),
      v.literal("invalidated")
    ),
    verifiedBy: v.optional(v.array(v.id("users"))),
    invalidatedBy: v.optional(v.array(v.id("users"))),
  })
    .index("by_border_crossing", ["borderCrossingId"])
    .index("by_user", ["userId"])
    .index("by_border_and_direction", ["borderCrossingId", "direction"]),

  // User Statistics
  userStats: defineTable({
    userId: v.id("users"),
    totalReports: v.number(),
    verifiedReports: v.number(),
    invalidatedReports: v.number(),
    trustScore: v.number(),
    lastReportAt: v.optional(v.number()),
  }).index("by_user", ["userId"]),

  // Chat Messages
  chatMessages: defineTable({
    userId: v.id("users"),
    borderCrossingId: v.optional(v.id("borderCrossings")),
    direction: v.optional(v.union(v.literal("ro-bg"), v.literal("bg-ro"))),
    message: v.string(),
    messageType: v.union(
      v.literal("text"),
      v.literal("status"),
      v.literal("alert")
    ),
    status: v.optional(v.union(
      v.literal("in_queue"),
      v.literal("crossed"),
      v.literal("blocked"),
      v.literal("moving_fast"),
      v.literal("moving_slow"),
      v.literal("how_long")
    )),
    sentAt: v.number(),
  }).index("by_border_crossing", ["borderCrossingId"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    borderCrossingId: v.id("borderCrossings"),
    direction: v.union(v.literal("ro-bg"), v.literal("bg-ro")),
    thresholdMinutes: v.number(),
    isActive: v.boolean(),
    lastNotifiedAt: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_crossing_and_direction", ["borderCrossingId", "direction"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
