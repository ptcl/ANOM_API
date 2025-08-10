import { Request, Response } from 'express';
import { agentService } from '../services/agentService';
import { AgentModel } from '../models/Agent';
import { IAgent } from '../types/agent';
import EmblemContract from '../models/EmblemContract';

export const createContract = async (req: Request, res: Response) => {
    try {
        const contractData = req.body;
        const agentId = req.user?.bungieId || req.body.agentId;

        // Vérifier que l'agent existe (par bungieId)
        const agent = await AgentModel.findOne({ bungieId: agentId });
        if (!agent) {
            return res.status(404).json({ message: "Agent non trouvé" });
        }

        // Créer le contrat
        const newContract = await EmblemContract.create(contractData);

        // Associer le contrat à l'agent
        agent.contracts.push(newContract._id);
        await agent.save();

        return res.status(201).json(newContract);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la création du contrat", error });
    }
};
export const deleteContract = async (req: Request, res: Response) => {
    try {
        const { contractId } = req.params;
        const contract = await EmblemContract.findOne({ contractId });
        if (!contract) {
            return res.status(404).json({ message: "Contrat non trouvé" });
        }
        await contract.deleteOne();

        // Retirer le contrat de l'agent
        await AgentModel.updateMany(
            { contracts: contract._id },
            { $pull: { contracts: contract._id } }
        );

        return res.json({ message: "Contrat supprimé avec succès" });
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la suppression du contrat", error });
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

export const getAgentAllContracts = async (req: Request, res: Response) => {
    try {
        const agentId = req.user?.bungieId || req.params.agentId;
        const agent = await AgentModel.findOne({ bungieId: agentId }).populate('contracts');
        if (!agent) {
            return res.status(404).json({ message: "Agent non trouvé" });
        }
        return res.json(agent.contracts);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la récupération des contrats de l'agent", error });
    }
};
export const getContractById = async (req: Request, res: Response) => {
    try {
        const { contractId } = req.params;
        const contract = await EmblemContract.findOne({ contractId });
        if (!contract) {
            return res.status(404).json({ message: "Contrat non trouvé" });
        }
        return res.json(contract);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la récupération du contrat", error });
    }
};


export const getAllContracts = async (_req: Request, res: Response) => {
    try {
        const contracts = await EmblemContract.find();
        return res.json(contracts);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la récupération des contrats", error });
    }
};






