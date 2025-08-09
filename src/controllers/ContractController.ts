import { Request, Response } from 'express';
import { agentService } from '../services/agentService';
import { AgentModel } from '../models/Agent';
import { IAgent } from '../types/agent';
import EmblemContract from '../models/EmblemContract';

export const createContract = async (req: Request, res: Response) => {
    try {
        const contractData = req.body;

        // Création du contrat
        const newContract = await EmblemContract.create(contractData);

        return res.status(201).json(newContract);
    } catch (error) {
        return res.status(400).json({ message: "Erreur lors de la création du contrat", error });
    }
};