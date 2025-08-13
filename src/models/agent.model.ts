import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
    bungieId: { type: String, required: true, unique: true },
    bungieTokens: {
        accessToken: { type: String, required: true },
        refreshToken: { type: String, required: true },
        expiresAt: { type: Date, required: true },
    },
    destinyMemberships: [{
        crossSaveOverride: { type: Number },
        applicableMembershipTypes: [{ type: Number }],
        isPublic: { type: Boolean },
        membershipType: { type: Number },
        membershipId: { type: String },
        displayName: { type: String },
        bungieGlobalDisplayName: { type: String },
        bungieGlobalDisplayNameCode: { type: Number }

    }],
    bungieUser: {
        membershipId: { type: Number },
        uniqueName: { type: String },
        displayName: { type: String },
        profilePicture: { type: Number },
        about: { type: String },
        firstAccess: { type: Date },
        lastAccess: { type: Date },
        psnDisplayName: { type: String },
        showActivity: { type: Boolean },
        locale: { type: String },
        localeInheritDefault: { type: Boolean },
        profilePicturePath: { type: String },
        profileThemeName: { type: String },
        steamDisplayName: { type: String },
        twitchDisplayName: { type: String },
        cachedBungieGlobalDisplayName: { type: String },
        cachedBungieGlobalDisplayNameCode: { type: Number }
    },
    protocol: {
        agentName: { type: String, required: true },
        customName: { type: String },
        species: { type: String, enum: ['HUMAN', 'EXO', 'AWOKEN'], required: true },
        role: { type: String, enum: ['AGENT', 'SPECIALIST', 'FOUNDER'], default: 'AGENT' },
        clearanceLevel: { type: Number, enum: [1, 2, 3], required: true },
        hasSeenRecruitment: { type: Boolean, default: false },
        protocolJoinedAt: { type: Date },
        group: { type: String, enum: ['PROTOCOL', 'AURORA', 'ZENITH'] },
        settings: {
            notifications: { type: Boolean, default: true },
            publicProfile: { type: Boolean, default: false },
            protocolOSTheme: { type: String, enum: ['DEFAULT', 'DARKNESS'], default: 'DEFAULT' },
            protocolSounds: { type: Boolean, default: true }
        }
    },
    contracts: [
        {
            contractMongoId: { type: mongoose.Schema.Types.ObjectId, ref: "Emblem-Contract" },
            contractId: { type: String }
        }
    ],
    challenges: [
        {
            challengeMongoId: { type: mongoose.Schema.Types.ObjectId, ref: "EmblemChallenge" },
            challengeId: { type: String },
            title: { type: String },
            complete: { type: Boolean, default: false },
            accessedAt: { type: Date, default: Date.now },
            completedAt: { type: Date },
            partialCode: { type: String },
            unlockedFragments: [{ type: String }],
            progress: { type: mongoose.Schema.Types.Mixed }
        }
    ],
    lastActivity: { type: Date, default: Date.now },
}, { timestamps: true });

agentSchema.index({ 'protocol.agentName': 1 });
agentSchema.index({ lastActivity: 1 });

export const AgentModel = mongoose.models.Agent || mongoose.model('Agent', agentSchema);
