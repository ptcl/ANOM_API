import mongoose from "mongoose";

const EmblemSchema = new mongoose.Schema({
    emblemId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    code: { type: String },
    rarity: { type: String, enum: ["COMMON", "UNCOMMON", "RARE", "LEGENDARY", "EXOTIC"], default: "COMMON", set: (v: string) => v.toUpperCase() },
    status: { type: String, enum: ["AVAILABLE", "UNAVAILABLE", "REVOKED", "REJECTED"], default: "UNAVAILABLE", set: (v: string) => v.toUpperCase() },
    deletedAt: { type: Date }
}, { timestamps: true });

export const EmblemModel = mongoose.models.Emblem || mongoose.model("Emblem", EmblemSchema);

