import mongoose from "mongoose";

const EmblemContractSchema = new mongoose.Schema({
    contractId: { type: String, unique: true, required: true },
    contractDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["pending", "validated", "cancelled", "revoked"], default: "pending" },

    validationDeadline: Date,
    isExpired: { type: Boolean, default: false },

    contributor: {
        bungieId: { type: String, required: true },
        displayName: { type: String, required: true },
        isAnonymous: { type: Boolean, default: false }
    },

    emblems: [
        {
            emblemId: { type: String, default: '' },
            name: String,
            code: String,
            status: { type: String, enum: ["available", "redeemed", "revoked"], default: "available" },
            redeemedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            redeemedDate: Date
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
            status: { type: String, enum: ["pending", "processed", "cancelled"], default: "pending" }
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

    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Emblem-Contract", EmblemContractSchema);
