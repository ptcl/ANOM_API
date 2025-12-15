import mongoose from "mongoose";

const ContractSchema = new mongoose.Schema({
    contractId: { type: String, unique: true, required: true },
    contractDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["PENDING", "VALIDATED", "CANCELLED", "REVOKED", "PARTIAL"], default: "PENDING", set: (v: string) => v.toUpperCase() },
    validationDeadline: Date,
    validationPeriod: { type: Number, enum: [7, 14], default: 14 },
    isExpired: { type: Boolean, default: false },
    contributors: [
        {
            bungieId: { type: String, required: true },
            displayName: { type: String, required: true },
            isAnonymous: { type: Boolean, default: false }
        }
    ],

    emblems: [
        {
            emblemId: { type: String, default: null },
            name: String,
            code: String,
            status: { type: String, enum: ["AVAILABLE", "REDEEMED", "REVOKED", "REJECTED"], default: "AVAILABLE", set: (v: string) => v.toUpperCase() },
            redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            redeemedDate: Date,
            rejectedAt: Date,
            deletedAt: Date
        }
    ],

    totalCodes: { type: Number, default: 0 },
    availableCodes: { type: Number, default: 0 },

    revocationRequests: [
        {
            requestDate: { type: Date, default: Date.now },
            effectiveDate: Date,
            emblemCodes: [String],
            isPartial: { type: Boolean, default: false },
            status: { type: String, enum: ["PENDING", "PROCESSED", "CANCELLED"], default: "PENDING", set: (v: string) => v.toUpperCase() }
        }
    ],
    media: [
        {
            url: { type: String, required: false },
            legend: { type: String, required: false }
        }
    ],

    signedDocumentPath: String,
    isSigned: { type: Boolean, default: false },
}, { timestamps: true });

export const ContractModel = mongoose.models.Contracts || mongoose.model("Contracts", ContractSchema);
