import { Schema, model } from "mongoose";

const BadgeSchema = new Schema({
    badgeId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: String,
    rarity: {
        type: String,
        enum: ["COMMON", "RARE", "EPIC", "LEGENDARY"],
        default: "COMMON"
    },
    icon: String,
    obtainable: { type: Boolean, default: true },
    linkedTier: Number,
    linkedTimeline: String,
    createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Indexes utiles pour recherche et affichage
BadgeSchema.index({ rarity: 1 });
BadgeSchema.index({ obtainable: 1 });
BadgeSchema.index({ linkedTier: 1 });

export const Badge = model("Badge", BadgeSchema);
