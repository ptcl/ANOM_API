import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'LOW' },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'PUBLISHED' },
    visibility: { type: String, enum: ['ALL', 'FOUNDERS', 'SPECIALISTS'], default: 'ALL' }
});

announcementSchema.pre('save', function (next) { this.updatedAt = new Date(); next(); });

export const AnnouncementModel = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);