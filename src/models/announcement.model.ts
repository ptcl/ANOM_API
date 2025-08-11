import mongoose from 'mongoose';

const announcementSchema = new mongoose.Schema({
    announcementId: { type: String, unique: true, required: true },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    priority: { type: String, enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'], default: 'LOW' },
    status: { type: String, enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'], default: 'PUBLISHED' },
    visibility: { type: String, enum: ['ALL', 'FOUNDERS', 'SPECIALISTS'], default: 'ALL' }
}, { timestamps: true });

export const AnnouncementModel = mongoose.models.Announcement || mongoose.model('Announcement', announcementSchema);