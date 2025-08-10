import { Request, Response } from 'express';
import { AnnouncementModel } from '../models/Announcement';

export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const announcementData = req.body;
        const newAnnouncement = await AnnouncementModel.create(announcementData);
        return res.status(201).json(newAnnouncement);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la création de l'annonce", error });
    }
};
