import { Request, Response } from 'express';
import { AgentModel } from '../models/Agent.model';
import { generateUniqueId } from '../utils/generate';
import EmblemModel from '../models/Emblem.model';

export const createEmblem = async (req: Request, res: Response) => {
    try {
        const codePattern = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}$/;
        if (req.body.code && !codePattern.test(req.body.code)) {
            return res.status(400).json({ message: "Le code doit être au format XXX-XXX-XXX (lettres ou chiffres)." });
        }

        const emblemData = {
            ...req.body,
            emblemId: generateUniqueId('EMBLEM')
        };
        const newEmblem = await EmblemModel.create(emblemData);
        return res.status(201).json(newEmblem);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la création de l'emblème", error });
    }
};

export const updateEmblem = async (req: Request, res: Response) => {
    try {
        const codePattern = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}$/;
        if (req.body.code !== undefined && !codePattern.test(req.body.code)) {
            return res.status(400).json({ message: "Le code doit être au format XXX-XXX-XXX (lettres ou chiffres)." });
        }

        const { emblemId } = req.params;
        const updatedEmblem = await EmblemModel.findOneAndUpdate(
            { emblemId },
            req.body,
            { new: true }
        );
        if (!updatedEmblem) {
            return res.status(404).json({ message: "Emblème non trouvé" });
        }
        return res.status(200).json(updatedEmblem);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la mise à jour de l'emblème", error });
    }
};

export const deleteEmblem = async (req: Request, res: Response) => {
    try {
        const { emblemId } = req.params;
        const deletedEmblem = await EmblemModel.findOneAndDelete({ emblemId });
        if (!deletedEmblem) {
            return res.status(404).json({ message: "Emblème non trouvé" });
        }
        return res.status(204).send();
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la suppression de l'emblème", error });
    }
};

export const getAllEmblems = async (req: Request, res: Response) => {
    try {
        const emblems = await EmblemModel.find();
        return res.status(200).json(emblems);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la récupération des emblèmes", error });
    }
};

export const getEmblemById = async (req: Request, res: Response) => {
    try {
        const { emblemId } = req.params;
        const emblem = await EmblemModel.findOne({ emblemId });
        if (!emblem) {
            return res.status(404).json({ message: "Emblème non trouvé" });
        }
        return res.status(200).json(emblem);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la récupération de l'emblème", error });
    }
};
