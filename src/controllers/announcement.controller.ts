import { Request, Response } from 'express';
import { AnnouncementModel } from '../models/Announcement.model';
import { generateUniqueId } from '../utils/generate';

export const createAnnouncement = async (req: Request, res: Response) => {
    try {
        const announcementData = {
            ...req.body,
            announcementId: generateUniqueId('ANN'),
        };
        const newAnnouncement = await AnnouncementModel.create(announcementData);
        return res.status(201).json(newAnnouncement);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la création de l'annonce", error });
    }
};

export const updateAnnouncement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const announcementData = req.body;

        const updatedAnnouncement = await AnnouncementModel.findOneAndUpdate(
            { announcementId: id },
            announcementData,
            { new: true, version: true }
        );

        if (!updatedAnnouncement) {
            return res.status(404).json({ message: "Annonce non trouvée" });
        }

        return res.json(updatedAnnouncement);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la mise à jour de l'annonce", error });
    }
};

export const deleteAnnouncement = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const announcement = await AnnouncementModel.findOneAndDelete({ announcementId: id });
        if (!announcement) {
            return res.status(404).json({ message: "Annonce non trouvée" });
        }
        return res.json({ message: "Annonce supprimée avec succès" });
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la suppression de l'annonce", error });
    }
};

export const getAllAnnouncements = async (_req: Request, res: Response) => {
    try {
        const announcements = await AnnouncementModel.find();
        return res.json(announcements);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la récupération des annonces", error });
    }
};
