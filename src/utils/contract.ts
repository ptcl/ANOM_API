import { Agent } from "../models/agent.model";
import { ContractModel } from "../models/contract.model";

export const checkContractAccess = async (contractId: string, userBungieId: string, userRoles?: string[]) => {
    const contract = await ContractModel.findOne({ contractId });

    if (!contract) {
        return { contract: null, hasAccess: false, error: "Contract not found" };
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
            error: "Access denied — this contract doesn't belong to you"
        };
    }

    return { contract, hasAccess: true, error: null };
};
