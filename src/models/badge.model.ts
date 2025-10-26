import { Schema, model } from "mongoose";

const BadgeSchema = new Schema({
    badgeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    rarity: { type: String, enum: ["COMMON", "UNCOMMON", "RARE", "LEGENDARY", "EXOTIC"], default: "COMMON" },
    icon: String,
    obtainable: { type: Boolean, default: true },
    linkedTier: Number,
    linkedTimeline: String,
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });


BadgeSchema.index({ rarity: 1 });
BadgeSchema.index({ obtainable: 1 });
BadgeSchema.index({ linkedTier: 1 });

BadgeSchema.pre("validate", function (next) {
    if (!this.badgeId) {
        const nameKey = typeof this.name === "string"
            ? this.name.split(".").slice(-2, -1)[0]?.toUpperCase()
            : "UNKNOWN";

        const year = new Date().getFullYear();
        const rarity = (this.rarity || "COMMON").toUpperCase();

        this.badgeId = `BADGE-${year}-${rarity}-${nameKey}`;
    }
    next();
});

export const Badge = model("Badge", BadgeSchema);
