import mongoose, { Schema, model } from "mongoose";

const BungieTokenSchema = new Schema({
  accessToken: String,
  refreshToken: String,
  expiresAt: Date
}, { _id: false });

const DestinyMembershipSchema = new Schema({
  crossSaveOverride: Number,
  applicableMembershipTypes: [Number],
  isPublic: Boolean,
  membershipType: { type: Number, required: true },
  membershipId: { type: String, required: true },
  displayName: String,
  bungieGlobalDisplayName: String,
  bungieGlobalDisplayNameCode: Number
}, { _id: false });

const BungieUserSchema = new Schema({
  membershipId: Number,
  uniqueName: String,
  displayName: String,
  profilePicture: Number,
  about: String,
  firstAccess: Date,
  lastAccess: Date,
  psnDisplayName: String,
  showActivity: Boolean,
  locale: String,
  localeInheritDefault: Boolean,
  profilePicturePath: String,
  profileThemeName: String,
  steamDisplayName: String,
  twitchDisplayName: String,
  cachedBungieGlobalDisplayName: String,
  cachedBungieGlobalDisplayNameCode: Number
}, { _id: false });

const AgentSettingsSchema = new Schema({
  notifications: { type: Boolean, default: true },
  publicProfile: { type: Boolean, default: true },
  protocolOSTheme: { type: String, enum: ["DEFAULT", "DARKNESS"], default: "DEFAULT", set: (v: string) => v.toUpperCase() },
  protocolSounds: { type: Boolean, default: true },
  language: { type: String, default: "fr" }
}, { _id: false });

const AgentBadgeSchema = new Schema({
  badgeId: { type: Schema.Types.ObjectId, ref: "Badge", required: true },
  obtainedAt: { type: Date, default: Date.now }
}, { _id: false });

const AgentStatsSchema = new Schema({
  timelinesCompleted: { type: Number, default: 0 },
  challengesSolved: { type: Number, default: 0 },
  fragmentsCollected: { type: Number, default: 0 },
  loreUnlocked: { type: Number, default: 0 },
  lastRewardedAt: Date
}, { _id: false });

const AgentHistorySchema = new Schema({
  action: { type: String, required: true },
  targetId: String,
  timestamp: { type: Date, default: Date.now },
  success: Boolean,
  meta: { type: Schema.Types.Mixed }
}, { _id: false });

const ProtocolSchema = new Schema({
  agentName: { type: String, required: true },
  customName: String,
  species: { type: String, enum: ["HUMAN", "EXO", "AWOKEN"], default: "HUMAN", set: (v: string) => v.toUpperCase() },
  roles: { type: [String], enum: ["AGENT", "ECHO", "ORACLE", "ARCHITECT", "FOUNDER", "EMISSARY"], default: ["AGENT"], set: (v: string[] | string) => Array.isArray(v) ? v.map((r) => r.toUpperCase()) : [v.toUpperCase()] },
  clearanceLevel: { type: Number, default: 1 },
  hasSeenRecruitment: { type: Boolean, default: false },
  protocolJoinedAt: { type: Date, default: Date.now },
  group: { type: String, enum: ["PROTOCOL", "AURORA", "ZENITH"], default: "PROTOCOL", set: (v: string) => v.toUpperCase() },
  settings: AgentSettingsSchema,
  badges: [AgentBadgeSchema],
  stats: AgentStatsSchema,
  history: [AgentHistorySchema]
}, { _id: false });

const roleHierarchy: Record<string, string[]> = {
  AGENT: [],
  ECHO: ["AGENT"],
  ORACLE: ["AGENT"],
  ARCHITECT: ["ECHO", "AGENT"],
  FOUNDER: ["ARCHITECT", "ECHO", "AGENT"],
  EMISSARY: ["AGENT"]
};
ProtocolSchema.pre("save", function (next) {
  const baseRoles = this.roles || ["AGENT"];
  const fullHierarchy = new Set<string>();

  for (const role of baseRoles) {
    fullHierarchy.add(role);
    const inherited = roleHierarchy[role] || [];
    inherited.forEach((r) => fullHierarchy.add(r));
  }

  this.roles = Array.from(fullHierarchy);
  next();
});

const AgentSchema = new Schema({
  bungieId: { type: String, required: true },

  bungieTokens: BungieTokenSchema,
  destinyMemberships: [DestinyMembershipSchema],
  bungieUser: BungieUserSchema,
  protocol: ProtocolSchema,
  lastActivity: Date,
  isActive: { type: Boolean, default: true },
  deactivatedAt: Date,
  deactivatedBy: String,
  deactivationReason: String,
  reactivatedAt: Date,
  reactivatedBy: String,

  contracts: [
    {
      contractMongoId: { type: mongoose.Schema.Types.ObjectId, ref: "Emblem-Contract", required: true },
      contractId: { type: String, required: true },
      createdAs: { type: String, enum: ["DONOR"], default: "DONOR" },
      linkedAt: { type: Date, default: Date.now },
      statusSnapshot: { type: String, enum: ["PENDING", "VALIDATED", "CANCELLED", "REVOKED"], default: "PENDING", set: (v: string) => v.toUpperCase() },
      lastSyncedAt: { type: Date, default: Date.now }
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


  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

/* -------------------------------------------------------------------------- */
/*                                   INDEXES                                  */
/* -------------------------------------------------------------------------- */

AgentSchema.index({ bungieId: 1 }, { unique: true, background: true });
AgentSchema.index({ "protocol.role": 1 });
AgentSchema.index({ "protocol.group": 1 });
AgentSchema.index({ "protocol.badges.badgeId": 1 });
AgentSchema.index({ "protocol.stats.timelinesCompleted": -1 });
AgentSchema.index({ isActive: 1 });
AgentSchema.index({ deactivatedAt: -1 });
/* -------------------------------------------------------------------------- */

export const Agent = model("Agent", AgentSchema);
