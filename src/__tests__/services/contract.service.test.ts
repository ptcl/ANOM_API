/**
 * Tests complets pour le service Contract
 * @file contract.service.test.ts
 * 
 * Adapté à la structure réelle du ContractService
 */

import { ContractService } from '../../services/contract.service';
import { ContractModel } from '../../models/contract.model';
import { EmblemModel } from '../../models/emblem.model';
import { Agent } from '../../models/agent.model';

jest.mock('../../models/contract.model');
jest.mock('../../models/emblem.model');
jest.mock('../../models/agent.model');
jest.mock('../../utils/generate', () => ({
    generateUniqueId: jest.fn((prefix) => `${prefix}-MOCK-12345`)
}));
jest.mock('../../utils', () => ({
    formatForUser: jest.fn(() => '2024-01-01 12:00:00')
}));

describe('ContractService', () => {
    let contractService: ContractService;

    beforeEach(() => {
        jest.clearAllMocks();
        contractService = new ContractService();
    });

    // ============================================
    // ACTIONS AGENT
    // ============================================
    describe('👤 Actions Agent', () => {

        describe('createContract', () => {

            it('devrait créer un contrat avec données valides', async () => {
                const contractData = {
                    emblems: [
                        { name: 'Test Emblem', code: 'ABC-123-DEF' }
                    ],
                    contributors: [
                        { bungieId: '123456', displayName: 'TestUser' }
                    ],
                    validationPeriod: 7
                };

                const user = {
                    bungieId: '123456',
                    protocol: { roles: ['AGENT'] }
                };

                const mockAgent = {
                    _id: 'agent-mongo-id',
                    bungieId: '123456',
                    contracts: [],
                    save: jest.fn().mockResolvedValue(true)
                };

                const mockCreatedContract = {
                    _id: 'contract-mongo-id',
                    contractId: 'CONT-MOCK-12345',
                    status: 'PENDING',
                    emblems: contractData.emblems
                };

                (Agent.find as jest.Mock).mockResolvedValue([mockAgent]);
                (ContractModel.create as jest.Mock).mockResolvedValue(mockCreatedContract);
                (EmblemModel.findOne as jest.Mock).mockResolvedValue(null);
                (EmblemModel.create as jest.Mock).mockResolvedValue({});

                const result = await contractService.createContract(contractData, user);

                expect(result.success).toBe(true);
                expect(result.data.contract.contractId).toBe('CONT-MOCK-12345');
                expect(result.message).toBe('Contract created successfully');
            });

            it('devrait rejeter sans contributeurs', async () => {
                const result = await contractService.createContract({
                    emblems: [{ name: 'Test', code: 'ABC' }],
                    contributors: []
                }, { bungieId: '123' });

                expect(result.success).toBe(false);
                expect(result.error).toBe('Missing required contributor information');
            });

            it('devrait rejeter sans emblèmes', async () => {
                const result = await contractService.createContract({
                    emblems: [],
                    contributors: [{ bungieId: '123', displayName: 'Test' }]
                }, { bungieId: '123' });

                expect(result.success).toBe(false);
                expect(result.error).toBe('At least one emblem is required');
            });

            it('devrait rejeter avec trop d\'emblèmes', async () => {
                const emblems = Array(101).fill({ name: 'Emblem', code: 'ABC-123' });

                const result = await contractService.createContract({
                    emblems,
                    contributors: [{ bungieId: '123', displayName: 'Test' }]
                }, { bungieId: '123' });

                expect(result.success).toBe(false);
                expect(result.error).toContain('Too many emblems');
            });

            it('devrait rejeter avec un emblème invalide', async () => {
                const result = await contractService.createContract({
                    emblems: [{ name: '', code: 'ABC' }],
                    contributors: [{ bungieId: '123', displayName: 'Test' }]
                }, { bungieId: '123' });

                expect(result.success).toBe(false);
            });

            it('devrait rejeter si aucun agent valide trouvé', async () => {
                (Agent.find as jest.Mock).mockResolvedValue([]);

                const result = await contractService.createContract({
                    emblems: [{ name: 'Test', code: 'ABC-DEF' }],
                    contributors: [{ bungieId: '123', displayName: 'Test' }]
                }, { bungieId: '123' });

                expect(result.success).toBe(false);
                expect(result.error).toBe('No valid agents found for contributors');
            });
        });

        describe('getAgentContracts', () => {

            it('devrait retourner les contrats d\'un agent', async () => {
                const mockAgent = {
                    _id: 'agent-id',
                    bungieId: '123456',
                    contracts: [
                        { contractMongoId: 'c1' },
                        { contractMongoId: 'c2' }
                    ]
                };

                const mockContracts = [
                    { _id: 'c1', contractId: 'CONT-001', status: 'PENDING', totalCodes: 5, availableCodes: 5 },
                    { _id: 'c2', contractId: 'CONT-002', status: 'VALIDATED', totalCodes: 3, availableCodes: 2 }
                ];

                (Agent.findOne as jest.Mock).mockResolvedValue(mockAgent);
                (ContractModel.find as jest.Mock).mockReturnValue({
                    sort: jest.fn().mockResolvedValue(mockContracts)
                });

                const result = await contractService.getAgentContracts('123456');

                expect(result.success).toBe(true);
                expect(result.data.contracts).toHaveLength(2);
                expect(result.data.stats.totalContracts).toBe(2);
            });

            it('devrait retourner une erreur si agent non trouvé', async () => {
                (Agent.findOne as jest.Mock).mockResolvedValue(null);

                const result = await contractService.getAgentContracts('unknown');

                expect(result.success).toBe(false);
                expect(result.error).toBe('Agent not found');
            });
        });

        describe('getContractById', () => {

            it('devrait retourner un contrat accessible', async () => {
                const mockContract = {
                    _id: 'c1',
                    contractId: 'CONT-001',
                    status: 'PENDING'
                };
                const mockAgent = { bungieId: '123456' };

                (ContractModel.findOne as jest.Mock).mockResolvedValue(mockContract);
                (Agent.findOne as jest.Mock).mockResolvedValue(mockAgent);

                const result = await contractService.getContractById('CONT-001', '123456');

                expect(result.success).toBe(true);
                expect(result.data.contract.contractId).toBe('CONT-001');
            });

            it('devrait refuser l\'accès à un contrat non associé', async () => {
                const mockContract = { contractId: 'CONT-001' };

                (ContractModel.findOne as jest.Mock).mockResolvedValue(mockContract);
                (Agent.findOne as jest.Mock).mockResolvedValue(null);

                const result = await contractService.getContractById('CONT-001', '999999');

                expect(result.success).toBe(false);
            });
        });

        describe('deleteContract', () => {

            it('devrait supprimer un contrat accessible', async () => {
                const mockContract = {
                    _id: 'c1',
                    contractId: 'CONT-001',
                    status: 'PENDING',
                    emblems: [{ code: 'ABC' }],
                    deleteOne: jest.fn().mockResolvedValue(true)
                };
                const mockAgent = { bungieId: '123456' };

                (ContractModel.findOne as jest.Mock).mockResolvedValue(mockContract);
                (Agent.findOne as jest.Mock).mockResolvedValue(mockAgent);
                (EmblemModel.deleteMany as jest.Mock).mockResolvedValue({ deletedCount: 1 });
                (Agent.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

                const result = await contractService.deleteContract('CONT-001', '123456');

                expect(result.success).toBe(true);
                expect(result.message).toBe('Contract deleted successfully');
            });
        });
    });

    // ============================================
    // ACTIONS FOUNDER (ADMIN)
    // ============================================
    describe('🔐 Actions Founder (Admin)', () => {

        describe('getAllContracts', () => {

            it('devrait retourner tous les contrats', async () => {
                const mockContracts = [
                    { contractId: 'C-001', status: 'PENDING' },
                    { contractId: 'C-002', status: 'VALIDATED' },
                    { contractId: 'C-003', status: 'REVOKED' }
                ];

                (ContractModel.find as jest.Mock).mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        lean: jest.fn().mockResolvedValue(mockContracts)
                    })
                });

                const result = await contractService.getAllContracts();

                expect(result.success).toBe(true);
                expect(result.data.contracts).toHaveLength(3);
                expect(result.data.count).toBe(3);
            });
        });

        describe('validateContract', () => {

            it('devrait valider un contrat PENDING', async () => {
                const mockContract = {
                    _id: 'mongo-id',
                    contractId: 'C-001',
                    status: 'PENDING',
                    emblems: [{ code: 'ABC', emblemId: 'E-001' }],
                    save: jest.fn().mockResolvedValue(true)
                };

                (ContractModel.findOne as jest.Mock).mockResolvedValue(mockContract);
                (EmblemModel.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 1 });
                (Agent.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

                const result = await contractService.validateContract('C-001');

                expect(result.success).toBe(true);
                expect(mockContract.status).toBe('VALIDATED');
                expect(result.message).toBe('Contract validated successfully');
            });

            it('devrait échouer si contrat non trouvé', async () => {
                (ContractModel.findOne as jest.Mock).mockResolvedValue(null);

                const result = await contractService.validateContract('C-UNKNOWN');

                expect(result.success).toBe(false);
                expect(result.error).toBe('Contract not found');
            });

            it('devrait échouer si contrat pas PENDING', async () => {
                const mockContract = {
                    contractId: 'C-001',
                    status: 'VALIDATED'
                };

                (ContractModel.findOne as jest.Mock).mockResolvedValue(mockContract);

                const result = await contractService.validateContract('C-001');

                expect(result.success).toBe(false);
                expect(result.error).toBe('Contract is not pending validation');
            });
        });

        describe('validateContractPartial', () => {

            it('devrait valider partiellement certains emblèmes', async () => {
                const mockContract = {
                    _id: 'mongo-id',
                    contractId: 'C-001',
                    status: 'PENDING',
                    emblems: [
                        { emblemId: 'E-001', code: 'ABC', status: 'AVAILABLE' },
                        { emblemId: 'E-002', code: 'DEF', status: 'AVAILABLE' }
                    ],
                    save: jest.fn().mockResolvedValue(true)
                };

                const decisions = [
                    { emblemId: 'E-001', accepted: true },
                    { emblemId: 'E-002', accepted: false }
                ];

                (ContractModel.findOne as jest.Mock).mockResolvedValue(mockContract);
                (EmblemModel.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 1 });
                (Agent.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

                const result = await contractService.validateContractPartial('C-001', decisions);

                expect(result.success).toBe(true);
                expect(mockContract.status).toBe('PARTIAL');
                expect(result.data.stats.accepted).toBe(1);
                expect(result.data.stats.rejected).toBe(1);
            });
        });

        describe('revokeContract', () => {

            it('devrait révoquer un contrat', async () => {
                const mockContract = {
                    _id: 'mongo-id',
                    contractId: 'C-001',
                    status: 'VALIDATED',
                    emblems: [{ code: 'ABC', emblemId: 'E-001' }],
                    save: jest.fn().mockResolvedValue(true)
                };

                (ContractModel.findOne as jest.Mock).mockResolvedValue(mockContract);
                (EmblemModel.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 1 });
                (Agent.updateMany as jest.Mock).mockResolvedValue({ modifiedCount: 1 });

                const result = await contractService.revokeContract('C-001');

                expect(result.success).toBe(true);
                expect(mockContract.status).toBe('REVOKED');
                expect(result.message).toContain('revoked');
            });
        });

        describe('cleanupExpiredEmblems', () => {

            it('devrait supprimer les emblèmes expirés', async () => {
                (EmblemModel.deleteMany as jest.Mock).mockResolvedValue({
                    deletedCount: 5
                });

                const result = await contractService.cleanupExpiredEmblems();

                expect(result.success).toBe(true);
                expect(result.data.deletedCount).toBe(5);
            });
        });
    });

    // ============================================
    // CONTRÔLE D'ACCÈS
    // ============================================
    describe('🔒 Contrôle d\'accès', () => {

        describe('checkContractAccess', () => {

            it('devrait permettre l\'accès au FOUNDER', async () => {
                const mockContract = { contractId: 'C-001' };

                (ContractModel.findOne as jest.Mock).mockResolvedValue(mockContract);

                const result = await contractService.checkContractAccess('C-001', '123456', ['FOUNDER']);

                expect(result.hasAccess).toBe(true);
                expect(result.error).toBeNull();
            });

            it('devrait permettre l\'accès au propriétaire du contrat', async () => {
                const mockContract = { contractId: 'C-001' };
                const mockAgent = { bungieId: '123456' };

                (ContractModel.findOne as jest.Mock).mockResolvedValue(mockContract);
                (Agent.findOne as jest.Mock).mockResolvedValue(mockAgent);

                const result = await contractService.checkContractAccess('C-001', '123456');

                expect(result.hasAccess).toBe(true);
            });

            it('devrait refuser l\'accès aux non-autorisés', async () => {
                const mockContract = { contractId: 'C-001' };

                (ContractModel.findOne as jest.Mock).mockResolvedValue(mockContract);
                (Agent.findOne as jest.Mock).mockResolvedValue(null);

                const result = await contractService.checkContractAccess('C-001', '999999', ['AGENT']);

                expect(result.hasAccess).toBe(false);
                expect(result.error).toBeDefined();
            });

            it('devrait retourner erreur si contrat non trouvé', async () => {
                (ContractModel.findOne as jest.Mock).mockResolvedValue(null);

                const result = await contractService.checkContractAccess('C-UNKNOWN', '123456');

                expect(result.hasAccess).toBe(false);
                expect(result.error).toBe('Contrat non trouvé');
            });
        });
    });
});
