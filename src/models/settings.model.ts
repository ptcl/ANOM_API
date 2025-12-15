import { Schema, model, Document } from "mongoose";

const RoleAssignmentSchema = new Schema({
    bungieId: { type: String, required: true },
    roleId: { type: String, required: true },
    note: { type: String }
}, { _id: false });

export interface IRoleAssignment {
    bungieId: string;
    roleId: string;
    note?: string;
}

export interface ISettings extends Document {
    roleOrder: string[];
    roleAssignments: IRoleAssignment[];
    createdAt: Date;
    updatedAt: Date;
}

const SettingsSchema = new Schema({
    roleOrder: { type: [String], default: ["FOUNDER", "ORACLE", "ECHO", "SPECTRE", "AGENT"], set: (v: string) => v.toUpperCase() },
    roleAssignments: { type: [RoleAssignmentSchema], default: [] }
}, { timestamps: true });

export const Settings = model<ISettings>("Settings", SettingsSchema);

export async function getSettings(): Promise<ISettings> {
    let settings = await Settings.findOne();
    if (!settings) {
        settings = await Settings.create({});
    }
    return settings;
}
