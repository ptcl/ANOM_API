import mongoose, { Schema, Document, model } from 'mongoose';

export interface IDivision extends Document {
    divisionId: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    leaderId?: string;
    isSystem: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const DivisionSchema = new Schema({
    divisionId: { type: String, required: true, unique: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    color: { type: String, trim: true, default: "#808080" },
    icon: { type: String, trim: true, default: "users" },
    leaderId: { type: String, trim: true },
    isSystem: { type: Boolean, default: false }
}, { timestamps: true });

DivisionSchema.index({ divisionId: 1 }, { unique: true });

export const Division = model<IDivision>('Division', DivisionSchema);
