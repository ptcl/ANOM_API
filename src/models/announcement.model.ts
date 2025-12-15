import mongoose from 'mongoose';

const ReadBySchema = new mongoose.Schema({
    agentId: { type: String, required: true },
    readAt: { type: Date, default: Date.now }
}, { _id: false });

const announcementSchema = new mongoose.Schema({
    announcementId: { type: String, unique: true, required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM', set: (v: string) => v.toUpperCase() },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'PUBLISHED', set: (v: string) => v.toUpperCase() },
    visibility: { type: String, enum: ['ALL', 'AGENT', 'ECHO', 'ORACLE', 'ARCHITECT', 'FOUNDER', 'EMISSARY', 'GROUP'], default: 'ALL', set: (v: string) => v.toUpperCase() },
    targetGroup: { type: String, default: '' },
    tags: { type: [String], default: [] },
    expiresAt: { type: Date },
    createdBy: { type: String, default: '' },
    readBy: { type: [ReadBySchema], default: [] }
}, { timestamps: true });

announcementSchema.index({ status: 1, visibility: 1 });
announcementSchema.index({ expiresAt: 1 });
announcementSchema.index({ createdAt: -1 });

export const AnnouncementModel = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);