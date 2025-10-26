import mongoose from "mongoose";

const EmblemSchema = new mongoose.Schema({
    emblemId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    code: { type: String },
    status: { type: String, enum: ["AVAILABLE", "UNAVAILABLE"], default: "UNAVAILABLE", set: (v: string) => v.toUpperCase() }
}, { timestamps: true });

export const EmblemModel = mongoose.models.Emblem || mongoose.model("Emblem", EmblemSchema);
