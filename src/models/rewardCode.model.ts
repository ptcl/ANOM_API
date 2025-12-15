import mongoose from "mongoose";

const RewardCodeRewardSchema = new mongoose.Schema({
    roles: { type: [String], default: [] },
    badgeIds: { type: [String], default: [] }
}, { _id: false });

const RewardCodeUsageSchema = new mongoose.Schema({
    agentId: { type: String, required: true },
    agentName: { type: String },
    usedAt: { type: Date, default: Date.now }
}, { _id: false });

const RewardCodeSchema = new mongoose.Schema({
    codeId: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    word: { type: String },
    rewards: { type: RewardCodeRewardSchema, default: () => ({ roles: [], badgeIds: [] }) },
    isUnique: { type: Boolean, default: true },
    maxUses: { type: Number },
    currentUses: { type: Number, default: 0 },
    description: { type: String },
    createdBy: { type: String, required: true },
    expiresAt: { type: Date },

    usedBy: { type: [RewardCodeUsageSchema], default: [] }
}, { timestamps: true });

RewardCodeSchema.index({ createdBy: 1 });
RewardCodeSchema.index({ expiresAt: 1 });
RewardCodeSchema.index({ isUnique: 1 });

export const RewardCode = mongoose.models.RewardCode || mongoose.model("RewardCode", RewardCodeSchema);
