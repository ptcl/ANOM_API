import { Schema, model, Document } from 'mongoose';

export interface IDivisionRequest extends Document {
    requestId: string;
    name: string;
    description?: string;
    color?: string;
    icon?: string;
    requestedBy: string;
    requestedByName?: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    reviewedBy?: string;
    reviewedAt?: Date;
    rejectionReason?: string;
    createdDivisionId?: string;
    createdAt: Date;
    updatedAt: Date;
}

const DivisionRequestSchema = new Schema<IDivisionRequest>({
    requestId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    color: { type: String },
    icon: { type: String },
    requestedBy: { type: String, required: true },
    requestedByName: { type: String },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    reviewedBy: { type: String },
    reviewedAt: { type: Date },
    rejectionReason: { type: String },
    createdDivisionId: { type: String }
}, {
    timestamps: true
});

DivisionRequestSchema.index({ status: 1 });
DivisionRequestSchema.index({ requestedBy: 1 });
DivisionRequestSchema.index({ createdAt: -1 });

export const DivisionRequest = model<IDivisionRequest>('DivisionRequest', DivisionRequestSchema);
