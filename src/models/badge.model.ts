import { Schema, model } from "mongoose";

const BadgeSchema = new Schema({
    badgeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    rarity: { type: String, enum: ["COMMON", "UNCOMMON", "RARE", "LEGENDARY", "EXOTIC"], default: "COMMON", set: (v: string) => v.toUpperCase() },
    icon: String,
    obtainable: { type: Boolean, default: true },
    linkedTier: Number,
    linkedTimeline: String
}, { timestamps: true });


BadgeSchema.index({ rarity: 1 });
BadgeSchema.index({ obtainable: 1 });
BadgeSchema.index({ linkedTier: 1 });

BadgeSchema.pre("validate", function () {
    if (!this.badgeId) {
        let nameKey = "UNKNOWN";

        if (typeof this.name === "string") {
            if (this.name.includes(".")) {
                const parts = this.name.split(".");
                nameKey = (parts[parts.length - 2] || parts[parts.length - 1] || "UNKNOWN").toUpperCase();
            } else {
                nameKey = this.name
                    .normalize("NFD")
                    .replace(/[\u0300-\u036f]/g, "")
                    .replace(/[^a-zA-Z0-9]/g, "")
                    .substring(0, 10)
                    .toUpperCase() || "UNKNOWN";
            }
        }

        const year = new Date().getFullYear();
        const rarity = (this.rarity || "COMMON").toUpperCase();
        const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

        this.badgeId = `BADGE-${year}-${rarity}-${nameKey}-${randomSuffix}`;
    }
});

export const Badge = model("Badge", BadgeSchema);
