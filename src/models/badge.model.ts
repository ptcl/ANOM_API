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

BadgeSchema.pre("save", async function (next) {
    if (!this.isNew || this.badgeId) return next()

    const rawName = this.name.trim()
    const normalizedName = rawName.includes(".")
        ? rawName.split(".")[2]
        : rawName
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "_")
            .replace(/^_|_$/g, "")

    const year = new Date().getFullYear()

    this.badgeId = `BADGE-${year}-${this.rarity}-${normalizedName}`.toUpperCase()

    next()
})

export const Badge = model("Badge", BadgeSchema);
