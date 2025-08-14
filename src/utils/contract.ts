import { AgentModel } from "../models/agent.model";
import { ContractModel } from "../models/contract.model";

export const checkContractAccess = async (contractId: string, userBungieId: string, userRole: string | any) => {
    const contract = await ContractModel.findOne({ contractId });
    if (!contract) {
        return { contract: null, hasAccess: false, error: "Contrat non trouvé" };
    }

    if (userRole === 'FOUNDER') {
        return { contract, hasAccess: true, error: null };
    }

    const agent = await AgentModel.findOne({
        bungieId: userBungieId,
        'contracts.contractId': contractId
    });

    if (!agent) {
        return { contract: null, hasAccess: false, error: "Accès refusé - Ce contrat ne vous appartient pas" };
    }

    return { contract, hasAccess: true, error: null };
};