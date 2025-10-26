import { Agent } from "../models/agent.model";
import { ContractModel } from "../models/contract.model";

export const checkContractAccess = async (contractId: string, userBungieId: string, userRoles?: string[]) => {
    const contract = await ContractModel.findOne({ contractId });

    if (!contract) {
        return { contract: null, hasAccess: false, error: "Contrat non trouvé" };
    }

    const privilegedRoles = ["FOUNDER"];
    const hasPrivilege = userRoles?.some((r) => privilegedRoles.includes(r.toUpperCase())) ?? false;

    if (hasPrivilege) {
        return { contract, hasAccess: true, error: null };
    }

    const agent = await Agent.findOne({
        bungieId: userBungieId,
        "contracts.contractId": contractId
    });

    if (!agent) {
        return {
            contract: null,
            hasAccess: false,
            error: "Accès refusé — ce contrat ne vous appartient pas"
        };
    }

    return { contract, hasAccess: true, error: null };
};
