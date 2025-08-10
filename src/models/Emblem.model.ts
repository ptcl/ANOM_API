import mongoose from "mongoose";

const EmblemSchema = new mongoose.Schema({
    emblemId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    image: { type: String },
    code: { type: String },
    status: { type: String, enum: ["available", "unavailable"], default: "available" }
}, { timestamps: true });

const EmblemModel = mongoose.model("Emblem", EmblemSchema);

export default EmblemModel;