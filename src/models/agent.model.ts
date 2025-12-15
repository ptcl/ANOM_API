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
  completedTimelines: { type: Number, default: 0 },
  fragmentsCollected: { type: Number, default: 0 },

  lastFragmentUnlockedAt: Date,
  lastSyncAt: Date
}, { _id: false });

const AgentHistorySchema = new Schema({
  action: { type: String, required: true },
  targetId: String,
  timestamp: { type: Date, default: Date.now },
  success: Boolean,
  meta: { type: Schema.Types.Mixed }
}, { _id: false });

const AgentTimelineLocalizationSchema = new Schema({
  currentTimelineId: { type: String, default: null },
  currentTimelineEntryId: { type: String, default: null },
  lastSyncedAt: { type: Date, default: Date.now },
}, { _id: false });

const ProtocolSchema = new Schema({
  agentName: { type: String, required: true },
  customName: String,
  species: { type: String, enum: ["HUMAN", "EXO", "AWOKEN"], default: "HUMAN", set: (v: string) => v.toUpperCase() },
  roles: { type: [String], default: ["AGENT"], set: (v: string[] | string) => Array.isArray(v) ? v.map((r) => r.toUpperCase()) : [v.toUpperCase()] },
  clearanceLevel: { type: Number, default: 1 },
  hasSeenRecruitment: { type: Boolean, default: false },
  protocolJoinedAt: { type: Date, default: Date.now },
  division: { type: String, default: "PROTOCOL", set: (v: string) => v.toUpperCase() },
  settings: AgentSettingsSchema,
  badges: [AgentBadgeSchema],
  stats: AgentStatsSchema,
  timelineLocalization: AgentTimelineLocalizationSchema,
  history: [AgentHistorySchema]
}, { _id: false });

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

  timelines: [
    {
      timelineMongoId: { type: mongoose.Schema.Types.ObjectId, ref: "Timeline", required: true },
      timelineId: { type: String, required: true },
      title: { type: String },
      accessedAt: { type: Date, default: Date.now },
      lastUpdatedAt: { type: Date, default: Date.now },
      currentEntryId: { type: String },
      fragmentsFound: { type: [String], default: [] },
      fragmentsCollected: { type: Number, default: 0 },
      keysFound: { type: [String], default: [] },
      entriesResolved: { type: [String], default: [] },
      completed: { type: Boolean, default: false },
      completedAt: { type: Date }
    }
  ],

}, { timestamps: true });

AgentSchema.index({ bungieId: 1 }, { unique: true, background: true });
AgentSchema.index({ "protocol.roles": 1 });
AgentSchema.index({ "protocol.division": 1 });
AgentSchema.index({ "protocol.badges.badgeId": 1 });
AgentSchema.index({ isActive: 1 });
AgentSchema.index({ deactivatedAt: -1 });
AgentSchema.index({ "timelines.timelineId": 1 });

export const Agent = model("Agent", AgentSchema);
