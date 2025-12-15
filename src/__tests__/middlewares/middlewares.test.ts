/**
 * Tests complets pour les middlewares d'authentification et d'accès
 * @file middlewares.test.ts
 * 
 * Adapté à l'implémentation réelle
 */

import { Request, Response, NextFunction } from 'express';
import { IdentityMiddleware } from '../../middlewares/identity.middleware';
import { AccessMiddleware } from '../../middlewares/access.middleware';
import { ActiveAgentMiddleware } from '../../middlewares/activeAgent.middleware';
import * as authUtils from '../../utils/auth';
import { agentService } from '../../services/agent.service';
import { Agent } from '../../models/agent.model';

// Mock des dépendances
jest.mock('../../utils/auth');
jest.mock('../../services/agent.service');
jest.mock('../../models/agent.model');
jest.mock('../../utils', () => ({
    formatForUser: jest.fn(() => '2024-01-01 12:00:00')
}));

describe('Middlewares', () => {

    let mockReq: Partial<Request>;
    let mockRes: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        jest.clearAllMocks();

        mockReq = {
            headers: {},
            ip: '127.0.0.1',
            get: jest.fn().mockReturnValue('Mozilla/5.0')
        };

        mockRes = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn().mockReturnThis()
        };

        mockNext = jest.fn();
    });

    // ============================================
    // IdentityMiddleware
    // ============================================
    describe('IdentityMiddleware', () => {

        it('devrait passer si token valide et agent existe', async () => {
            mockReq.headers = { authorization: 'Bearer valid-token' };

            const mockAgent = {
                _id: { toString: () => 'agent-123' },
                bungieId: '123456',
                protocol: {
                    agentName: 'TestAgent',
                    roles: ['AGENT'],
                    clearanceLevel: 1
                }
            };

            (authUtils.verifyJWT as jest.Mock).mockReturnValue({
                agentId: 'agent-123',
                bungieId: '123456'
            });
            (agentService.getAgentById as jest.Mock).mockResolvedValue(mockAgent);
            (agentService.updateLastActivity as jest.Mock).mockResolvedValue(undefined);

            await IdentityMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.user).toBeDefined();
            expect(mockReq.user?.agentId).toBe('agent-123');
        });

        it('devrait rejeter sans header Authorization', async () => {
            mockReq.headers = {};

            await IdentityMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Unauthorized'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('devrait rejeter sans préfixe Bearer', async () => {
            mockReq.headers = { authorization: 'Basic token' };

            await IdentityMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('devrait rejeter un token trop long', async () => {
            mockReq.headers = { authorization: `Bearer ${'a'.repeat(3000)}` };

            await IdentityMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        it('devrait rejeter si agent non trouvé', async () => {
            mockReq.headers = { authorization: 'Bearer valid-token' };

            (authUtils.verifyJWT as jest.Mock).mockReturnValue({
                agentId: 'agent-123',
                bungieId: '123456'
            });
            (agentService.getAgentById as jest.Mock).mockResolvedValue(null);

            await IdentityMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        it('devrait rejeter si token invalide (exception)', async () => {
            mockReq.headers = { authorization: 'Bearer invalid-token' };

            (authUtils.verifyJWT as jest.Mock).mockImplementation(() => {
                throw new Error('Invalid token');
            });

            await IdentityMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        it('devrait rejeter si protocol manquant dans agent', async () => {
            mockReq.headers = { authorization: 'Bearer valid-token' };

            (authUtils.verifyJWT as jest.Mock).mockReturnValue({
                agentId: 'agent-123',
                bungieId: '123456'
            });
            (agentService.getAgentById as jest.Mock).mockResolvedValue({
                _id: { toString: () => 'agent-123' },
                bungieId: '123456',
                protocol: null
            });

            await IdentityMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
        });

        it('devrait rejeter si decoded.agentId n\'est pas une string', async () => {
            mockReq.headers = { authorization: 'Bearer valid-token' };

            (authUtils.verifyJWT as jest.Mock).mockReturnValue({
                agentId: 12345, // number au lieu de string
                bungieId: '123456'
            });

            await IdentityMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
        });
    });

    // ============================================
    // AccessMiddleware (FOUNDER only)
    // ============================================
    describe('AccessMiddleware', () => {

        it('devrait passer pour un FOUNDER', async () => {
            mockReq.user = {
                agentId: 'founder-123',
                bungieId: '123456',
                protocol: {
                    agentName: 'Founder',
                    roles: ['FOUNDER', 'AGENT'],
                    clearanceLevel: 10
                }
            };

            await AccessMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('devrait rejeter sans user context', async () => {
            mockReq.user = undefined;

            await AccessMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Unauthorized - No user context'
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('devrait rejeter un AGENT normal', async () => {
            mockReq.user = {
                agentId: 'agent-123',
                bungieId: '123456',
                protocol: {
                    agentName: 'Agent',
                    roles: ['AGENT'],
                    clearanceLevel: 1
                }
            };

            await AccessMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Forbidden - Insufficient privileges'
            });
        });

        it('devrait rejeter si roles vides', async () => {
            mockReq.user = {
                agentId: 'agent-123',
                bungieId: '123456',
                protocol: {
                    agentName: 'Agent',
                    roles: [],
                    clearanceLevel: 1
                }
            };

            await AccessMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Forbidden - No valid roles found'
            });
        });

        it('devrait normaliser les rôles en majuscules', async () => {
            mockReq.user = {
                agentId: 'founder-123',
                bungieId: '123456',
                protocol: {
                    agentName: 'Founder',
                    roles: ['founder'], // minuscules
                    clearanceLevel: 10
                }
            };

            await AccessMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('devrait gérer le champ roles à la racine de user', async () => {
            (mockReq as any).user = {
                agentId: 'founder-123',
                bungieId: '123456',
                roles: ['FOUNDER'] // Directement sur user au lieu de protocol.roles
            };

            await AccessMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });
    });

    // ============================================
    // ActiveAgentMiddleware
    // ============================================
    describe('ActiveAgentMiddleware', () => {

        it('devrait passer pour un agent actif', async () => {
            (mockReq as any).user = {
                agentId: 'agent-123',
                bungieId: '123456'
            };

            (Agent.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    _id: 'agent-123',
                    isActive: true
                })
            });

            await ActiveAgentMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockNext).toHaveBeenCalled();
        });

        it('devrait rejeter sans agentId dans user', async () => {
            (mockReq as any).user = undefined;

            await ActiveAgentMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(401);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Unauthorized'
            });
        });

        it('devrait rejeter un agent désactivé avec status 403', async () => {
            (mockReq as any).user = {
                agentId: 'agent-123',
                bungieId: '123456'
            };

            const deactivatedAt = new Date('2024-01-15');
            (Agent.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue({
                    _id: 'agent-123',
                    isActive: false,
                    deactivatedAt
                })
            });

            await ActiveAgentMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Account deactivated',
                message: 'Votre compte a été désactivé. Contactez un administrateur.',
                deactivatedAt
            });
        });

        it('devrait retourner 404 si agent non trouvé', async () => {
            (mockReq as any).user = {
                agentId: 'agent-unknown',
                bungieId: '123456'
            };

            (Agent.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue(null)
            });

            await ActiveAgentMiddleware(mockReq as Request, mockRes as Response, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({
                success: false,
                error: 'Agent not found'
            });
        });
    });

    // ============================================
    // TESTS D'INTÉGRATION MIDDLEWARE CHAIN
    // ============================================
    describe('🔗 Chaîne de Middlewares', () => {

        it('devrait valider la chaîne complète pour un agent', async () => {
            mockReq.headers = { authorization: 'Bearer valid-token' };

            const mockAgent = {
                _id: { toString: () => 'agent-123' },
                bungieId: '123456',
                isActive: true,
                protocol: {
                    agentName: 'TestAgent',
                    roles: ['AGENT'],
                    clearanceLevel: 1
                }
            };

            (authUtils.verifyJWT as jest.Mock).mockReturnValue({
                agentId: 'agent-123',
                bungieId: '123456'
            });
            (agentService.getAgentById as jest.Mock).mockResolvedValue(mockAgent);
            (agentService.updateLastActivity as jest.Mock).mockResolvedValue(undefined);

            // Step 1: IdentityMiddleware
            await IdentityMiddleware(mockReq as Request, mockRes as Response, mockNext);
            expect(mockNext).toHaveBeenCalled();
            expect(mockReq.user).toBeDefined();

            // Reset mocks
            mockNext = jest.fn();

            // Step 2: ActiveAgentMiddleware
            (Agent.findById as jest.Mock).mockReturnValue({
                select: jest.fn().mockResolvedValue({ isActive: true })
            });
            await ActiveAgentMiddleware(mockReq as Request, mockRes as Response, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });

        it('devrait valider la chaîne complète pour un fondateur', async () => {
            mockReq.headers = { authorization: 'Bearer founder-token' };

            const mockFounder = {
                _id: { toString: () => 'founder-123' },
                bungieId: '987654',
                isActive: true,
                protocol: {
                    agentName: 'TestFounder',
                    roles: ['FOUNDER', 'AGENT'],
                    clearanceLevel: 10
                }
            };

            (authUtils.verifyJWT as jest.Mock).mockReturnValue({
                agentId: 'founder-123',
                bungieId: '987654'
            });
            (agentService.getAgentById as jest.Mock).mockResolvedValue(mockFounder);
            (agentService.updateLastActivity as jest.Mock).mockResolvedValue(undefined);

            // Step 1: IdentityMiddleware
            await IdentityMiddleware(mockReq as Request, mockRes as Response, mockNext);
            expect(mockNext).toHaveBeenCalled();

            mockNext = jest.fn();

            // Step 2: AccessMiddleware (FOUNDER check)
            await AccessMiddleware(mockReq as Request, mockRes as Response, mockNext);
            expect(mockNext).toHaveBeenCalled();
        });

        it('devrait bloquer un agent sur une route FOUNDER', async () => {
            mockReq.headers = { authorization: 'Bearer agent-token' };

            const mockAgent = {
                _id: { toString: () => 'agent-123' },
                bungieId: '123456',
                isActive: true,
                protocol: {
                    agentName: 'TestAgent',
                    roles: ['AGENT'],
                    clearanceLevel: 1
                }
            };

            (authUtils.verifyJWT as jest.Mock).mockReturnValue({
                agentId: 'agent-123',
                bungieId: '123456'
            });
            (agentService.getAgentById as jest.Mock).mockResolvedValue(mockAgent);
            (agentService.updateLastActivity as jest.Mock).mockResolvedValue(undefined);

            // Step 1: IdentityMiddleware - passe
            await IdentityMiddleware(mockReq as Request, mockRes as Response, mockNext);
            expect(mockNext).toHaveBeenCalled();

            mockNext = jest.fn();
            mockRes.status = jest.fn().mockReturnThis();
            mockRes.json = jest.fn().mockReturnThis();

            // Step 2: AccessMiddleware - BLOQUE
            await AccessMiddleware(mockReq as Request, mockRes as Response, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(403);
            expect(mockNext).not.toHaveBeenCalled();
        });
    });
});
