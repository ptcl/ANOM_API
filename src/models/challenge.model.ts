import mongoose from "mongoose";

const ChallengeSchema = new mongoose.Schema({
    challengeId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String },
    targetCode: { type: String, required: true },
    codeFormat: { type: String, default: "AAA-BBB-CCC" },
    isSharedChallenge: { type: Boolean, default: false },
    finalCode: {
        type: mongoose.Schema.Types.Mixed,
        default: {
            AAA: { A1: "", A2: "", A3: "" },
            BBB: { B1: "", B2: "", B3: "" },
            CCC: { C1: "", C2: "", C3: "" }
        }
    },
    challenges: [
        {
            fragmentId: [String],
            challengeType: { type: String, required: true },
            groups: [
                {
                    accessCode: { type: String, required: true },
                    promptLines: { type: [String], required: true }
                }
            ],
            expectedOutput: { type: String, required: true },
            hintLines: { type: [String] },
            rewardId: { type: String, required: true },
            isActive: { type: Boolean, default: true },
            createdAt: { type: Date, default: Date.now },
            updatedAt: { type: Date, default: Date.now }
        }
    ],

    isComplete: { type: Boolean, default: false },
    AgentProgress: [
        {
            agentId: { type: mongoose.Schema.Types.ObjectId, ref: "Agent" },
            bungieId: { type: String },
            displayName: { type: String },
            unlockedFragments: [String],
            currentProgress: { type: String },
            complete: { type: Boolean, default: false },
            lastUpdated: { type: Date, default: Date.now }
        }
    ]

}, { timestamps: true });

export const ChallengeModel = mongoose.models.Challenge || mongoose.model("Challenge", ChallengeSchema);
