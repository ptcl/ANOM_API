import { Schema, model } from "mongoose";
import { IRoleDocument } from "../types/role";
const RoleSchema = new Schema({
    roleId: { type: String, required: true, unique: true, set: (v: string) => v.toUpperCase(), trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, trim: true, default: "#808080" },
    permissions: [{ type: String, trim: true }],
    isSystem: { type: Boolean, default: false }
}, { timestamps: true });

RoleSchema.index({ isSystem: 1 });

export const Role = model<IRoleDocument>("Role", RoleSchema);
