import mongoose, { Model } from 'mongoose';
import { IAnnouncement, IAnnouncementMethods, IAnnouncementModel } from '../types/announcement';

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: function () { const now = new Date(); return new Date(now.setDate(now.getDate() + 30)); } }, // Date d'expiration de l'annonce, par défaut 30 jours après la création
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'MEDIUM' },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'PUBLISHED' },
    tags: [{ type: String, trim: true }],
    readBy: [{ agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent' }, readAt: { type: Date, default: Date.now } }],
    visibility: { type: String, enum: ['ALL', 'FOUNDERS', 'SPECIALISTS', 'GROUP'], default: 'ALL' }, // Configurer qui peut voir cette annonce (tous les agents, un groupe spécifique, etc.)
    targetGroup: { type: String, enum: ['PROTOCOL', 'AURORA', 'ZENITH'], required: function (this: any) { return this.visibility === 'GROUP'; } } // Si visibility est GROUP, spécifier le groupe cible
});

announcementSchema.index({ createdAt: -1 });
announcementSchema.index({ status: 1, priority: -1 });
announcementSchema.index({ expiresAt: 1 });
announcementSchema.index({ 'readBy.agentId': 1 });

announcementSchema.methods.markAsReadBy = async function (agentId: mongoose.Types.ObjectId | string) {
    const alreadyRead = this.readBy.some((entry: any) => entry.agentId.toString() === agentId.toString());

    if (!alreadyRead) {
        this.readBy.push({ agentId, readAt: new Date() });
        await this.save();
    }

    return this;
};

announcementSchema.statics.getUnreadByAgent = async function (agentId: mongoose.Types.ObjectId | string) {
    return this.find({
        status: 'PUBLISHED',
        expiresAt: { $gt: new Date() },
        'readBy.agentId': { $ne: agentId }
    }).sort({ priority: -1, createdAt: -1 });
};

announcementSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

export const AnnouncementModel = (mongoose.models.Announcement as Model<IAnnouncement, IAnnouncementModel, IAnnouncementMethods>) ||
    mongoose.model<IAnnouncement, Model<IAnnouncement, IAnnouncementModel, IAnnouncementMethods>>('Announcement', announcementSchema);
