import mongoose from 'mongoose';

const LorePageSchema = new mongoose.Schema({
    pageNumber: { type: Number, required: true },
    title: { type: String, trim: true, default: '' },
    content: { type: String, required: true }
}, { _id: false });

const LoreTrackingSchema = new mongoose.Schema({
    agentId: { type: String, required: true },
    unlockedAt: { type: Date },
    readAt: { type: Date },
    lastPageRead: { type: Number, default: 0 }
}, { _id: false });

const LoreSchema = new mongoose.Schema({
    loreId: { type: String, unique: true, required: true },
    title: { type: String, required: true, trim: true },
    summary: { type: String, trim: true },
    pages: { type: [LorePageSchema], default: [] },
    totalPages: { type: Number, default: 0 },
    category: { type: String, enum: ['HISTORY', 'CHARACTER', 'LOCATION', 'EVENT', 'ARTIFACT', 'FACTION', 'TECHNOLOGY', 'OTHER'], default: 'OTHER', set: (v: string) => v.toUpperCase() },
    tags: { type: [String], default: [] },
    parentLoreId: { type: String, default: '' },
    relatedLoreIds: { type: [String], default: [] },
    isLocked: { type: Boolean, default: true },
    unlockConditions: {
        requiredTimelineIds: { type: [String], default: [] },
        requiredEntryIds: { type: [String], default: [] },
        requiredLoreIds: { type: [String], default: [] },
        requiredFragments: { type: Number, default: 0 },
        manualUnlock: { type: Boolean, default: false }
    },
    coverImage: { type: String, default: '' },
    audio: { type: String, default: '' },
    externalLinks: { type: [String], default: [] },
    author: { type: String, default: '' },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'DRAFT', set: (v: string) => v.toUpperCase() },
    visibility: { type: String, enum: ['PUBLIC', 'AGENTS_ONLY', 'UNLOCKED_ONLY'], default: 'UNLOCKED_ONLY', set: (v: string) => v.toUpperCase() },
    order: { type: Number, default: 0 },
    unlockedBy: { type: [LoreTrackingSchema], default: [] },
    readBy: { type: [LoreTrackingSchema], default: [] }
}, { timestamps: true });

LoreSchema.pre('save', function () {
    this.totalPages = this.pages?.length || 0;
});
LoreSchema.index({ category: 1 });
LoreSchema.index({ status: 1, visibility: 1 });
LoreSchema.index({ tags: 1 });
LoreSchema.index({ parentLoreId: 1 });
LoreSchema.index({ order: 1 });

export const LoreModel = mongoose.models.Lore || mongoose.model('Lore', LoreSchema);
