import { Request, Response } from 'express';
import { AgentModel } from '../models/agent.model';
import { generateUniqueId } from '../utils/generate';
import { ContractModel } from '../models/contract.model';
import { checkContractAccess } from '../utils/contract';

export const createContract = async (req: Request, res: Response) => {
    try {
        const emblemsWithId = (req.body.emblems || []).map((emblem: any) => ({
            ...emblem,
            emblemId: generateUniqueId('EMBLEM')
        }));

        const contractData = {
            ...req.body,
            contractId: generateUniqueId('CONT'),
            emblems: emblemsWithId
        };
        const userRole = req.user?.protocol?.role;
        const isFounder = userRole === 'FOUNDER';
        const targetAgentId = isFounder ? req.body.agentId : req.user?.bungieId;

        if (!targetAgentId) {
            return res.status(400).json({ message: "Agent cible non spécifié" });
        }

        const agent = await AgentModel.findOne({ bungieId: targetAgentId });
        if (!agent) {
            return res.status(404).json({ message: "Agent non trouvé" });
        }

        const newContract = await ContractModel.create(contractData);

        agent.contracts.push({
            contractMongoId: newContract._id,
            contractId: newContract.contractId
        });
        await agent.save();

        return res.status(201).json(newContract);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la création du contrat", error });
    }
};

export const deleteContract = async (req: Request, res: Response) => {
    try {
        const { contractId } = req.params;
        const userBungieId = req.user?.bungieId;
         const userRole = req.user?.protocol?.role;

        if (!userBungieId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        const { contract, hasAccess, error } = await checkContractAccess(contractId, userBungieId, userRole);

        if (!hasAccess || !contract) {
            return res.status(403).json({ message: error });
        }

        await contract.deleteOne();

        await AgentModel.updateMany(
            { 'contracts.contractId': contractId },
            { $pull: { contracts: { contractId: contractId } } }
        );

        return res.json({ message: "Contrat supprimé avec succès" });
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la suppression du contrat", error });
    }
};

export const updateContract = async (req: Request, res: Response) => {
    try {
        const { contractId } = req.params;
        const userBungieId = req.user?.bungieId;
          const userRole = req.user?.protocol?.role;

        if (!userBungieId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        const { contract, hasAccess, error } = await checkContractAccess(contractId, userBungieId, userRole);

        if (!hasAccess || !contract) {
            return res.status(403).json({ message: error });
        }

        const contractData = req.body;
        const updatedContract = await ContractModel.findOneAndUpdate(
            { contractId },
            contractData,
            { new: true }
        );

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
        const userBungieId = req.user?.bungieId;
        const isFounder = req.user?.protocol?.role === 'FOUNDER';
        const targetAgentId = isFounder ? (req.params.agentId || userBungieId) : userBungieId;

        if (!targetAgentId) {
            return res.status(400).json({ message: "Agent non spécifié" });
        }

        const agent = await AgentModel.findOne({ bungieId: targetAgentId }).populate('contracts.contractMongoId');

        if (!agent) {
            return res.status(404).json({ message: "Agent non trouvé" });
        }

        const contracts = agent.contracts.map((c: { contractMongoId: any; }) => c.contractMongoId).filter(Boolean);

        return res.json(contracts);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la récupération des contrats de l'agent", error });
    }
};

export const getContractById = async (req: Request, res: Response) => {
    try {
        const { contractId } = req.params;
        const userBungieId = req.user?.bungieId;
        const userRole = req.user?.protocol?.role;

        if (!userBungieId) {
            return res.status(401).json({ message: "Utilisateur non authentifié" });
        }

        const { contract, hasAccess, error } = await checkContractAccess(contractId, userBungieId, userRole);

        if (!hasAccess || !contract) {
            return res.status(403).json({ message: error });
        }

        return res.json(contract);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la récupération du contrat", error });
    }
};

export const getAllContracts = async (_req: Request, res: Response) => {
    try {
        const contracts = await ContractModel.find();
        return res.json(contracts);
    } catch (error) {
        return res.status(500).json({ message: "Erreur lors de la récupération des contrats", error });
    }
};