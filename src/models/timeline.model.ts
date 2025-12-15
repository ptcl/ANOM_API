import mongoose from "mongoose";

const SecurityProtocolSchema = new mongoose.Schema({
    clearanceLevel: { type: String, enum: ["1", "2", "3", "4", "5"], default: "1", set: (v: string) => v.toUpperCase() },
    accessMode: { type: String, enum: ["PUBLIC", "RESTRICTED", "CLASSIFIED"], default: "PUBLIC", set: (v: string) => v.toUpperCase() },
    accessCode: { type: String, required: true },
    requiresAuth: { type: Boolean, default: false },
    requires2FA: { type: Boolean, default: false },
    whiteList: { type: [String], default: [] },
    blackList: { type: [String], default: [] },
    autoLockOnBreach: { type: Boolean, default: false },
    maxAttempts: { type: Number, default: 3 },
    lockDuration: { type: Number, default: 60 },
    isCompromised: { type: Boolean, default: false },
    breachLogs: { type: [String], default: [] }
});

const MetadataSchema = new mongoose.Schema({
    createdBy: { type: String },
    collaborators: { type: [String] },
    ownerTeam: { type: String, default: "" },
    version: { type: String, default: "1.0" },
    editHistory: [{
        version: { type: String },
        changes: { type: [String] },
        updatedBy: { type: String },
        updatedAt: { type: Date, default: Date.now }
    }],
    visibility: { type: String, enum: ["PUBLIC", "PRIVATE"], default: "PUBLIC", set: (v: string) => v.toUpperCase() },
    validatedBy: { type: String },
    validatedAt: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: false },
    updatedBy: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const StateFlagsSchema = new mongoose.Schema({
    isDraft: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    isOpen: { type: Boolean, default: false },
    isProgress: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isClosed: { type: Boolean, default: false },
    isStabilized: { type: Boolean, default: false }
});

const ExternalRefsSchema = new mongoose.Schema({
    images: { type: [String], default: [] },
    videos: { type: [String], default: [] },
    documents: { type: [String], default: [] },
    links: { type: [String], default: [] }
});

const ActivityMetricsSchema = new mongoose.Schema({
    totalAttempts: { type: Number, default: 0 },
    totalCompleted: { type: Number, default: 0 },
    avgCompletionTime: { type: Number, default: 0 },
    lastCompletedAt: { type: Date, default: Date.now },
    lastActivityAt: { type: Date, default: Date.now }
});

const EntrySchema = new mongoose.Schema({
    entryId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ["ENIGMA", "FIREWALL", "DATA_NODE"], default: "ENIGMA", set: (v: string) => v.toUpperCase() },
    accessCode: { type: String, required: true },
    solution: { type: String },
    linkedFragment: { type: [String], default: [] },
    linkedLore: { type: [String], default: [] },
    reward: { type: String, enum: ["FRAGMENT", "INDEX", "NONE"], default: "FRAGMENT", set: (v: string) => v.toUpperCase() },
    status: { type: String, enum: ["ACTIVE", "LOCKED", "SOLVED"], default: "ACTIVE", set: (v: string) => v.toUpperCase() },
    dialogs: {
        intro: { type: [String], default: [] },
        success: { type: [String], default: [] },
        failure: { type: [String], default: [] }
    },
    grantKeys: { type: [String], default: [] },
    requiredKeys: { type: [String], default: [] }
});

EntrySchema.add({
    subEntries: [EntrySchema]
});

EntrySchema.index({ type: 1 });
EntrySchema.index({ status: 1 });

const ParticipantSchema = new mongoose.Schema({
    agentId: { type: String, required: true },
    teamId: { type: String, default: "" },
    progress: { type: Number, default: 0 },
    fragmentsFound: { type: [String], default: [] },
    fragmentsCollected: { type: Number, default: 0 },
    keysFound: { type: [String], default: [] },
    lastActivityAt: { type: Date, default: Date.now },
    completed: { type: Boolean, default: false }
});

ParticipantSchema.index({ agentId: 1 });
ParticipantSchema.index({ completed: 1 });

const TeamSchema = new mongoose.Schema({
    teamId: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    members: { type: [String], default: [] },
    progress: { type: Number, default: 0 },
    fragmentsFound: { type: [String], default: [] },
    fragmentsCollected: { type: Number, default: 0 }
});

TeamSchema.index({ teamId: 1 });

const StabilizationSchema = new mongoose.Schema({
    winnerType: { type: String, enum: ["AGENT", "TEAM"], default: "AGENT", set: (v: string) => v.toUpperCase() },
    winnerAgentId: { type: String, default: "" },
    winnerTeamId: { type: String, default: "" },
    completedAt: { type: Date, default: Date.now }
});

const RewardSchema = new mongoose.Schema({
    discordRoleId: { type: String },
    badge: { type: String },
    emblem: { type: [String] },
    archivesEntry: { type: Boolean, default: false },
    indexAccess: { type: Boolean, default: false },
    specialFragment: { type: Boolean, default: false },
    irlObject: { type: Boolean, default: false }
});

const LoreLockRuleSchema = new mongoose.Schema({
    loreRefs: { type: [String], default: [] },
    loreUnlocked: { type: [String], default: [] },
    loreLockRules: { type: [String], default: [] }
});

const LogSchema = new mongoose.Schema({
    agentId: { type: String },
    teamId: { type: String },
    action: { type: String },
    entryId: { type: String },
    timestamp: { type: Date, default: Date.now },
    success: { type: Boolean, default: false }
});

LogSchema.index({ agentId: 1, timestamp: -1 });
LogSchema.index({ entryId: 1 });

const CodeSchema = new mongoose.Schema({
    format: { type: String, enum: ["AAA-BBB-CCC", "AAA-BBB-CCC-DDD"], default: "AAA-BBB-CCC" },
    pattern: {
        type: mongoose.Schema.Types.Mixed,
        default: function () {
            if (this.format === "AAA-BBB-CCC") {
                return {
                    AAA: { A1: "", A2: "", A3: "" },
                    BBB: { B1: "", B2: "", B3: "" },
                    CCC: { C1: "", C2: "", C3: "" }
                };
            } else if (this.format === "AAA-BBB-CCC-DDD") {
                return {
                    AAA: { A1: "", A2: "", A3: "" },
                    BBB: { B1: "", B2: "", B3: "" },
                    CCC: { C1: "", C2: "", C3: "" },
                    DDD: { D1: "", D2: "", D3: "" }
                };
            }
            return {
                AAA: { A1: "", A2: "", A3: "" },
                BBB: { B1: "", B2: "", B3: "" },
                CCC: { C1: "", C2: "", C3: "" }
            };
        }
    },
    targetCode: { type: [String], default: [] }
});

const TimelineSchema = new mongoose.Schema({
    timelineId: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    description: { type: String },
    tier: { type: Number, enum: [1, 2, 3, 4, 5], default: 1 },
    isShared: { type: Boolean, default: false },
    status: { type: String, enum: ["DRAFT", "DELETED", "OPEN", "PROGRESS", "ARCHIVED", "CLOSED", "STABILIZED"], default: "DRAFT", set: (v: string) => v.toUpperCase() },
    code: CodeSchema,
    emblemId: { type: [String], required: true },
    metadata: MetadataSchema,
    securityProtocol: SecurityProtocolSchema,
    stateFlags: StateFlagsSchema,
    externalRefs: ExternalRefsSchema,
    activityMetrics: ActivityMetricsSchema,
    entries: [EntrySchema],
    participants: [ParticipantSchema],
    teams: [TeamSchema],
    stabilizedAt: StabilizationSchema,
    rewards: RewardSchema,
    loreLockRules: LoreLockRuleSchema,
    logs: [LogSchema]
}, { timestamps: true });

TimelineSchema.index({ status: 1 });
TimelineSchema.index({ tier: 1 });
TimelineSchema.index({ "stateFlags.isDeleted": 1 });
TimelineSchema.index({ "stateFlags.isArchived": 1 });
TimelineSchema.index({ createdAt: -1 });

TimelineSchema.pre('save', function () {
    try {
        if (!this.stateFlags) {
            this.stateFlags = {
                isDraft: false,
                isDeleted: false,
                isOpen: false,
                isProgress: false,
                isArchived: false,
                isClosed: false,
                isStabilized: false
            };
        }

        const currentStatus = this.status || "DRAFT";

        this.stateFlags.isDraft = (currentStatus === "DRAFT");
        this.stateFlags.isDeleted = (currentStatus === "DELETED");
        this.stateFlags.isOpen = (currentStatus === "OPEN");
        this.stateFlags.isProgress = (currentStatus === "PROGRESS");
        this.stateFlags.isArchived = (currentStatus === "ARCHIVED");
        this.stateFlags.isClosed = (currentStatus === "CLOSED");
        this.stateFlags.isStabilized = (currentStatus === "STABILIZED");

        this.markModified('stateFlags');

    } catch (error) {
    }
});

export const Timeline = mongoose.model("Timeline", TimelineSchema);