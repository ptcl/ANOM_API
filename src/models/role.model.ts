import { Schema, model, Document } from "mongoose";

export interface IRole extends Document {
    roleId: string;
    name: string;
    description?: string;
    permissions: string[];
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const RoleSchema = new Schema({
    roleId: { type: String, required: true, unique: true, set: (v: string) => v.toUpperCase(), trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    permissions: [{ type: String, trim: true }],
    isSystem: { type: Boolean, default: false }
}, { timestamps: true });

RoleSchema.index({ isSystem: 1 });

export const Role = model<IRole>("Role", RoleSchema);
