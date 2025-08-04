import mongoose from "mongoose";

const agentSchema = new mongoose.Schema({
    bungieId: { type: String, required: true, unique: true },
    bungieTokens: {
        accessToken: { type: String, required: true },
        refreshToken: { type: String, required: true },
        expiresAt: { type: Date, required: true }
    },
    lastActivity: { type: Date, default: Date.now },
    rawdata: { type: mongoose.Schema.Types.Mixed },
    protocol: {
        agentName: { type: String, required: true },
        customName: { type: String },
        species: { type: String, enum: ['HUMAN', 'EXO', 'AWOKEN'], required: true },
        role: { type: String, enum: ['AGENT', 'SPECIALIST', 'FOUNDER', ''], default: 'AGENT' },
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
    }
},
    {
        timestamps: true
    });

// Ajout d'index pour améliorer les performances
agentSchema.index({ bungieId: 1 }, { unique: true });
agentSchema.index({ 'protocol.agentName': 1 });
agentSchema.index({ lastActivity: 1 });

export const AgentModel = mongoose.models.Agent || mongoose.model('Agent', agentSchema);
