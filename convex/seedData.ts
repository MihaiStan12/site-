import { mutation } from "./_generated/server";

// Seed initial border crossing data
export const seedBorderCrossings = mutation({
  args: {},
  handler: async (ctx) => {
    // Check if data already exists
    const existing = await ctx.db.query("borderCrossings").first();
    if (existing) {
      return "Data already exists";
    }

    const borderCrossings = [
      {
        name: "Giurgiu-Ruse",
        nameRo: "Podul Giurgiu-Ruse",
        location: { lat: 43.8347, lng: 25.9657 },
        countries: ["România", "Bulgaria"],
        isActive: true,
      },

    ];

    for (const crossing of borderCrossings) {
      await ctx.db.insert("borderCrossings", crossing);
    }

    return "Border crossings seeded successfully";
  },
});
