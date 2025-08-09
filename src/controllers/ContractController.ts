import { Request, Response } from 'express';
import { agentService } from '../services/agentService';
import { AgentModel } from '../models/Agent';
import { IAgent } from '../types/agent';
import EmblemContract from '../models/EmblemContract';

export const createContract = async (req: Request, res: Response) => {
    try {
        const contractData = req.body;
        const agentId = req.body.agentId; // ou req.user.id si tu utilises l'authentification

        const newContract = await EmblemContract.create(contractData);

        // Associer le contrat à l'agent
        await AgentModel.findByIdAndUpdate(
            agentId,
            { $push: { contracts: newContract._id } },
            { new: true }
        );

        return res.status(201).json(newContract);
    } catch (error) {
        return res.status(400).json({ message: "Erreur lors de la création du contrat", error });
    }
};

export const getContractById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const contract = await EmblemContract.findById(id);

        if (!contract) {
            return res.status(404).json({ message: "Contrat non trouvé" });
        }

        return res.json(contract);
    } catch (error) {
        return res.status(400).json({ message: "Erreur lors de la récupération du contrat", error });
    }
};

export const getAllContracts = async (req: Request, res: Response) => {
    try {
        const contracts = await EmblemContract.find();

        return res.json(contracts);
    } catch (error) {
        return res.status(400).json({ message: "Erreur lors de la récupération des contrats", error });
    }
};

export const updateContract = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const contractData = req.body;

        const updatedContract = await EmblemContract.findByIdAndUpdate(id, contractData, { new: true });

        if (!updatedContract) {
            return res.status(404).json({ message: "Contrat non trouvé" });
        }

        return res.json(updatedContract);
    } catch (error) {
        return res.status(400).json({ message: "Erreur lors de la mise à jour du contrat", error });
    }
};

export const deleteContract = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const deletedContract = await EmblemContract.findByIdAndDelete(id);

        if (!deletedContract) {
            return res.status(404).json({ message: "Contrat non trouvé" });
        }

        return res.json({ message: "Contrat supprimé avec succès" });
    } catch (error) {
        return res.status(400).json({ message: "Erreur lors de la suppression du contrat", error });
    }
};

export const getAgentContracts = async (req: Request, res: Response) => {
    try {
        const { agentId } = req.params;

        const agent = await AgentModel.findById(agentId).populate('contracts');

        if (!agent) {
            return res.status(404).json({ message: "Agent non trouvé" });
        }

        return res.json(agent.contracts);
    } catch (error) {
        return res.status(400).json({ message: "Erreur lors de la récupération des contrats de l'agent", error });
    }
};

