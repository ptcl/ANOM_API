import { Agent } from "../models/agent.model";
import { ContractModel } from "../models/contract.model";
import { EmblemModel } from "../models/emblem.model";
import { IContract, IEmblem, IContributor } from "../types/contract";
import { IEmblem as IEmblemGlobal } from "../types/emblem";
import { generateUniqueId } from "../utils/generate";
import { logger } from "../utils";
import { findAgentByIdentifier } from "../utils/verifyAgent.helper";

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 1000;
const MAX_EMBLEM_CODE_LENGTH = 9;
const MAX_LEGEND_LENGTH = 200;
const MAX_CODES_PER_CONTRACT = 100;
const EMBLEM_RETENTION_DAYS = 30;

const VALID_CONTRACT_STATUSES: IContract['status'][] = ['PENDING', 'VALIDATED', 'CANCELLED', 'REVOKED', 'PARTIAL'];
const VALID_VALIDATION_PERIODS = [7, 14];

export class ContractService {
    async createContract(data: { emblems: any[]; contributors: any[]; validationDeadline?: string; validationPeriod?: number; media?: any[]; }, user: any): Promise<any> {
        try {
            const { emblems, contributors, validationDeadline, validationPeriod, media } = data;

            if (!Array.isArray(contributors) || contributors.length === 0) {
                return { success: false, error: 'Missing required contributor information' };
            }

            for (const c of contributors) {
                if (!c.bungieId || !c.displayName) {
                    return { success: false, error: 'Invalid contributor data' };
                }
            }

            if (!Array.isArray(emblems) || emblems.length === 0) {
                return { success: false, error: 'At least one emblem is required' };
            }

            if (emblems.length > MAX_CODES_PER_CONTRACT) {
                return { success: false, error: `Too many emblems (max ${MAX_CODES_PER_CONTRACT})` };
            }

            const period = (VALID_VALIDATION_PERIODS.includes(validationPeriod!)
                ? validationPeriod!
                : 14) as 7 | 14;

            let parsedDeadline: Date | null = null;
            if (validationDeadline) {
                parsedDeadline = new Date(validationDeadline);
                if (isNaN(parsedDeadline.getTime()) || parsedDeadline <= new Date()) {
                    return { success: false, error: 'Invalid validation deadline' };
                }
            } else {
                parsedDeadline = new Date();
                parsedDeadline.setDate(parsedDeadline.getDate() + period);
            }

            const contributorAgents = await Agent.find({
                bungieId: { $in: contributors.map((c: any) => c.bungieId.toString()) }
            });

            if (contributorAgents.length === 0) {
                return { success: false, error: 'No valid agents found for contributors' };
            }

            const sanitizedEmblems: IEmblem[] = [];
            for (const emblem of emblems) {
                if (!emblem.name || !emblem.code) {
                    return { success: false, error: 'Invalid emblem data' };
                }

                if (typeof emblem.name !== 'string' || emblem.name.length === 0 || emblem.name.length > MAX_TITLE_LENGTH) {
                    return { success: false, error: 'Invalid emblem name' };
                }

                const codeWithoutDashes = emblem.code.replace(/-/g, '');
                if (typeof emblem.code !== 'string' || emblem.code.length === 0 || codeWithoutDashes.length > MAX_EMBLEM_CODE_LENGTH) {
                    return { success: false, error: 'Invalid emblem code' };
                }

                sanitizedEmblems.push({
                    emblemId: generateUniqueId('EMBLEM'),
                    name: emblem.name,
                    code: emblem.code,
                    status: 'AVAILABLE' as const
                });
            }

            const sanitizedContributors: IContributor[] = contributors.map((c: any) => ({
                bungieId: c.bungieId.toString(),
                displayName: c.displayName.toString().substring(0, MAX_TITLE_LENGTH),
                isAnonymous: !!c.isAnonymous
            }));

            const sanitizedMedia = Array.isArray(media)
                ? media.filter((m: any) => m.url && typeof m.url === 'string')
                    .slice(0, sanitizedEmblems.length)
                    .map((m: any) => ({
                        url: m.url,
                        legend: m.legend ? m.legend.toString().trim().substring(0, MAX_LEGEND_LENGTH) : undefined
                    }))
                : [];

            const contractData: Partial<IContract> = {
                contractId: generateUniqueId('CONT'),
                contributors: sanitizedContributors,
                emblems: sanitizedEmblems,
                totalCodes: sanitizedEmblems.length,
                availableCodes: sanitizedEmblems.length,
                validationDeadline: parsedDeadline || undefined,
                validationPeriod: period,
                media: sanitizedMedia,
                status: 'PENDING',
                isExpired: false,
                isSigned: false,
                revocationRequests: [],
                contractDate: new Date()
            };

            const newContract = await ContractModel.create(contractData);
            await this.createEmblemsInGlobalCollection(sanitizedEmblems, newContract.contractId);

            for (const contributorAgent of contributorAgents) {
                contributorAgent.contracts.push({
                    contractMongoId: newContract._id,
                    contractId: newContract.contractId,
                    createdAs: "DONOR",
                    linkedAt: new Date(),
                    statusSnapshot: newContract.status,
                    lastSyncedAt: new Date()
                });
                await contributorAgent.save();
            }

            return {
                success: true,
                data: { contract: newContract },
                message: 'Contract created successfully'
            };

        } catch (error: any) {
            logger.error('Contract creation error:', {
                error: error.message
            });
            throw error;
        }
    }

    private async createEmblemsInGlobalCollection(emblems: IEmblem[], contractId: string): Promise<void> {
        for (const emblem of emblems) {
            try {
                const existingEmblem = await EmblemModel.findOne({ code: emblem.code });

                if (!existingEmblem) {
                    const emblemData: Partial<IEmblemGlobal> = {
                        emblemId: emblem.emblemId,
                        name: emblem.name,
                        code: emblem.code,
                        status: 'UNAVAILABLE',
                        image: '',
                        description: `Emblem from contract ${contractId}`,
                    };
                    await EmblemModel.create(emblemData);
                } else {
                    logger.info('Emblem already exists:', {
                        code: emblem.code,
                        existingEmblemId: existingEmblem.emblemId
                    });
                }
            } catch (emblemError: any) {
                logger.error('Emblem creation error:', {
                    emblemCode: emblem.code,
                    error: emblemError.message
                });
            }
        }
    }

    async validateContract(contractId: string): Promise<any> {
        try {
            const contract = await ContractModel.findOne({ contractId });

            if (!contract) {
                return { success: false, error: 'Contract not found' };
            }

            if (contract.status !== 'PENDING') {
                return { success: false, error: 'Contract is not pending validation' };
            }

            contract.status = 'VALIDATED';
            contract.updatedAt = new Date();
            await contract.save();

            const emblemCodes = contract.emblems?.map((e: any) => e.code) || [];
            await EmblemModel.updateMany(
                { code: { $in: emblemCodes } },
                { $set: { status: 'AVAILABLE' } }
            );

            await this.syncAgentsContractStatus(contract._id, 'VALIDATED');

            return {
                success: true,
                data: { contract },
                message: 'Contract validated successfully'
            };

        } catch (error: any) {
            logger.error('Contract validation error:', error.message);
            throw error;
        }
    }

    async validateContractPartial(contractId: string, emblemDecisions: { emblemId: string; accepted: boolean }[]): Promise<any> {
        try {
            const contract = await ContractModel.findOne({ contractId });

            if (!contract) {
                return { success: false, error: 'Contract not found' };
            }

            if (contract.status !== 'PENDING') {
                return { success: false, error: 'Contract is not pending validation' };
            }

            let acceptedCount = 0;
            let rejectedCount = 0;
            const acceptedCodes: string[] = [];
            const rejectedCodes: string[] = [];

            for (const decision of emblemDecisions) {
                const emblemIndex = contract.emblems?.findIndex((e: any) => e.emblemId === decision.emblemId);

                if (emblemIndex !== undefined && emblemIndex >= 0 && contract.emblems) {
                    if (decision.accepted) {
                        contract.emblems[emblemIndex].status = 'AVAILABLE';
                        acceptedCodes.push(contract.emblems[emblemIndex].code);
                        acceptedCount++;
                    } else {
                        contract.emblems[emblemIndex].status = 'REJECTED' as any;
                        contract.emblems[emblemIndex].rejectedAt = new Date();
                        rejectedCodes.push(contract.emblems[emblemIndex].code);
                        rejectedCount++;
                    }
                }
            }

            const totalEmblems = contract.emblems?.length || 0;
            if (acceptedCount === totalEmblems) {
                contract.status = 'VALIDATED';
            } else if (rejectedCount === totalEmblems) {
                contract.status = 'CANCELLED';
            } else {
                contract.status = 'PARTIAL' as any;
            }

            contract.availableCodes = acceptedCount;
            contract.updatedAt = new Date();
            await contract.save();

            if (acceptedCodes.length > 0) {
                await EmblemModel.updateMany(
                    { code: { $in: acceptedCodes } },
                    { $set: { status: 'AVAILABLE' } }
                );
            }

            if (rejectedCodes.length > 0) {
                await EmblemModel.updateMany(
                    { code: { $in: rejectedCodes } },
                    {
                        $set: {
                            status: 'REJECTED',
                            deletedAt: new Date()
                        }
                    }
                );
            }

            await this.syncAgentsContractStatus(contract._id, contract.status as string);

            return {
                success: true,
                data: {
                    contract,
                    stats: {
                        accepted: acceptedCount,
                        rejected: rejectedCount,
                        total: totalEmblems
                    }
                },
                message: 'Contract partially validated'
            };

        } catch (error: any) {
            logger.error('Contract partial validation error:', error.message);
            throw error;
        }
    }

    async revokeContract(contractId: string): Promise<any> {
        try {
            const contract = await ContractModel.findOne({ contractId });

            if (!contract) {
                return { success: false, error: 'Contract not found' };
            }

            contract.status = 'REVOKED';
            contract.updatedAt = new Date();
            await contract.save();

            const emblemCodes = contract.emblems?.map((e: any) => e.code) || [];
            const deletedAt = new Date();

            await EmblemModel.updateMany(
                { code: { $in: emblemCodes } },
                {
                    $set: {
                        status: 'REVOKED',
                        deletedAt: deletedAt
                    }
                }
            );

            if (contract.emblems) {
                for (const emblem of contract.emblems) {
                    emblem.status = 'REVOKED';
                    (emblem as any).deletedAt = deletedAt;
                }
                await contract.save();
            }

            await this.syncAgentsContractStatus(contract._id, 'REVOKED');

            return {
                success: true,
                data: { contract },
                message: `Contract revoked. Emblems will be permanently deleted after ${EMBLEM_RETENTION_DAYS} days.`
            };

        } catch (error: any) {
            logger.error('Contract revocation error:', error.message);
            throw error;
        }
    }

    async unrevokeContract(contractId: string): Promise<any> {
        try {
            const contract = await ContractModel.findOne({ contractId });

            if (!contract) {
                return { success: false, error: 'Contract not found' };
            }

            if (contract.status !== 'REVOKED') {
                return { success: false, error: 'Contract is not revoked' };
            }

            contract.status = 'PENDING';
            contract.updatedAt = new Date();

            if (contract.emblems) {
                for (const emblem of contract.emblems) {
                    if (emblem.status === 'REVOKED') {
                        emblem.status = 'AVAILABLE';
                        delete (emblem as any).deletedAt;
                    }
                }
            }
            await contract.save();

            const emblemCodes = contract.emblems?.map((e: any) => e.code) || [];
            await EmblemModel.updateMany(
                { code: { $in: emblemCodes }, status: 'REVOKED' },
                {
                    $set: { status: 'UNAVAILABLE' },
                    $unset: { deletedAt: 1 }
                }
            );

            await this.syncAgentsContractStatus(contract._id, 'PENDING');

            logger.info('Contract unrevoked', { contractId });

            return {
                success: true,
                data: { contract },
                message: 'Contract restored to PENDING - requires re-validation'
            };

        } catch (error: any) {
            logger.error('Contract unrevoke error:', error.message);
            throw error;
        }
    }

    async deleteContract(contractId: string, userBungieId: string, userRoles?: string[]): Promise<any> {
        try {
            const { contract, hasAccess, error } = await this.checkContractAccess(contractId, userBungieId, userRoles);

            if (!hasAccess || !contract) {
                return { success: false, error: error || 'Access denied' };
            }

            const emblemCodes = contract.emblems?.map((e: any) => e.code) || [];
            await EmblemModel.deleteMany({ code: { $in: emblemCodes } });
            await contract.deleteOne();
            await Agent.updateMany(
                { "contracts.contractId": contractId },
                { $pull: { contracts: { contractId: contractId } } }
            );

            return {
                success: true,
                message: 'Contract deleted successfully'
            };

        } catch (error: any) {
            logger.error('Contract deletion error:', error.message);
            throw error;
        }
    }

    async updateContract(contractId: string, updateData: Partial<IContract>, userBungieId: string, userRoles?: string[]): Promise<any> {
        try {
            const { contract, hasAccess, error } = await this.checkContractAccess(contractId, userBungieId, userRoles);

            if (!hasAccess || !contract) {
                return { success: false, error: error || 'Access denied' };
            }

            const allowedUpdates: Partial<IContract> = {
                updatedAt: new Date()
            };

            if (updateData.status !== undefined && VALID_CONTRACT_STATUSES.includes(updateData.status)) {
                allowedUpdates.status = updateData.status;

                if (updateData.status === 'VALIDATED') {
                    const emblemCodes = contract.emblems?.map((e: any) => e.code) || [];
                    await EmblemModel.updateMany(
                        { code: { $in: emblemCodes } },
                        { $set: { status: 'AVAILABLE' } }
                    );
                }
            }

            if (updateData.validationDeadline !== undefined) {
                if (updateData.validationDeadline === null) {
                    allowedUpdates.validationDeadline = undefined;
                } else {
                    const parsedDeadline = new Date(updateData.validationDeadline);
                    if (!isNaN(parsedDeadline.getTime()) && parsedDeadline > new Date()) {
                        allowedUpdates.validationDeadline = parsedDeadline;
                    }
                }
            }

            if (updateData.isExpired !== undefined) {
                allowedUpdates.isExpired = !!updateData.isExpired;
            }

            if (updateData.isSigned !== undefined) {
                allowedUpdates.isSigned = !!updateData.isSigned;
            }

            const updatedContract = await ContractModel.findOneAndUpdate(
                { contractId },
                { $set: allowedUpdates },
                { new: true }
            );

            if (updatedContract) {
                await this.syncAgentsContractStatus(updatedContract._id, updatedContract.status as string);
            }

            return {
                success: true,
                data: { contract: updatedContract },
                message: 'Contract updated successfully'
            };

        } catch (error: any) {
            logger.error('Contract update error:', error.message);
            throw error;
        }
    }

    async getAgentContracts(agentIdentifier: string): Promise<any> {
        try {
            const agent = await findAgentByIdentifier(agentIdentifier);

            if (!agent) {
                return { success: false, error: 'Agent not found' };
            }

            const contractMongoIds = (agent.contracts || []).map((c: any) => c.contractMongoId).filter(Boolean);
            const contracts = await ContractModel.find({ _id: { $in: contractMongoIds } }).sort({ createdAt: -1 });

            const stats = {
                totalContracts: contracts.length,
                totalContractsPending: contracts.filter(c => c.status?.toUpperCase() === 'PENDING').length,
                totalContractsValidated: contracts.filter(c => c.status?.toUpperCase() === 'VALIDATED').length,
                totalContractsCancelled: contracts.filter(c => c.status?.toUpperCase() === 'CANCELLED').length,
                totalContractsRevoked: contracts.filter(c => c.status?.toUpperCase() === 'REVOKED').length,
                totalContractsPartial: contracts.filter(c => c.status?.toUpperCase() === 'PARTIAL').length,
                totalEmblems: contracts.reduce((sum, c) => sum + (c.totalCodes || 0), 0),
                totalEmblemsAvailable: contracts.reduce((sum, c) => sum + (c.availableCodes || 0), 0),
                totalEmblemsRedeemed: contracts.reduce((sum, c) => sum + ((c.totalCodes || 0) - (c.availableCodes || 0)), 0)
            };

            return {
                success: true,
                data: { contracts, stats, count: contracts.length },
                message: 'Agent contracts retrieved successfully'
            };

        } catch (error: any) {
            logger.error('Agent contracts fetch error:', error.message);
            throw error;
        }
    }

    async getContractById(contractId: string, userBungieId: string, userRoles?: string[]): Promise<any> {
        try {
            const { contract, hasAccess, error } = await this.checkContractAccess(contractId, userBungieId, userRoles);

            if (!hasAccess || !contract) {
                return { success: false, error: error || 'Access denied' };
            }

            return {
                success: true,
                data: { contract },
                message: 'Contract retrieved successfully'
            };

        } catch (error: any) {
            logger.error('Contract fetch error:', error.message);
            throw error;
        }
    }

    async getAllContracts(): Promise<any> {
        try {
            const contracts = await ContractModel.find()
                .sort({ createdAt: -1 })
                .lean();

            return {
                success: true,
                data: { contracts, count: contracts.length },
                message: 'All contracts retrieved successfully'
            };

        } catch (error: any) {
            logger.error('All contracts fetch error:', error.message);
            throw error;
        }
    }

    async cleanupExpiredEmblems(): Promise<any> {
        try {
            const expirationDate = new Date();
            expirationDate.setDate(expirationDate.getDate() - EMBLEM_RETENTION_DAYS);

            const result = await EmblemModel.deleteMany({
                status: { $in: ['REVOKED', 'REJECTED'] },
                deletedAt: { $lte: expirationDate }
            });

            return {
                success: true,
                data: { deletedCount: result.deletedCount },
                message: `Cleaned up ${result.deletedCount} expired emblems`
            };

        } catch (error: any) {
            logger.error('Emblem cleanup error:', error.message);
            throw error;
        }
    }

    async checkContractAccess(contractId: string, userBungieId: string, userRoles?: string[]): Promise<{ contract: any; hasAccess: boolean; error: string | null; }> {
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
                error: "Access denied — this contract does not belong to you"
            };
        }

        return { contract, hasAccess: true, error: null };
    }

    private async syncAgentsContractStatus(contractMongoId: any, status: string): Promise<void> {
        await Agent.updateMany(
            { "contracts.contractMongoId": contractMongoId },
            {
                $set: {
                    "contracts.$.statusSnapshot": status,
                    "contracts.$.lastSyncedAt": new Date()
                }
            }
        );
    }
}

export const contractService = new ContractService();
