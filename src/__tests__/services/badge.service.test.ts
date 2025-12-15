/**
 * Tests complets pour le service Badge
 * @file badge.service.test.ts
 * 
 * Adapté à la structure réelle du BadgeService
 */

import { BadgeService } from '../../services/badge.service';
import { Badge } from '../../models/badge.model';
import { Timeline } from '../../models/timeline.model';
import { findAgentByIdentifier } from '../../utils/verifyAgent.helper';

jest.mock('../../models/badge.model');
jest.mock('../../models/timeline.model');
jest.mock('../../utils/verifyAgent.helper');

const mockFindAgentByIdentifier = findAgentByIdentifier as jest.MockedFunction<typeof findAgentByIdentifier>;

describe('BadgeService', () => {
    let badgeService: BadgeService;

    beforeEach(() => {
        jest.clearAllMocks();
        badgeService = new BadgeService();
    });

    // ============================================
    // ACTIONS PUBLIQUES
    // ============================================
    describe('🌐 Actions Publiques', () => {

        describe('getAllBadges', () => {

            it('devrait retourner tous les badges avec pagination', async () => {
                const mockBadges = [
                    { _id: 'b1', name: 'Badge 1', rarity: 'COMMON' },
                    { _id: 'b2', name: 'Badge 2', rarity: 'RARE' }
                ];

                (Badge.find as jest.Mock).mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        skip: jest.fn().mockReturnValue({
                            limit: jest.fn().mockReturnValue({
                                lean: jest.fn().mockResolvedValue(mockBadges)
                            })
                        })
                    })
                });
                (Badge.countDocuments as jest.Mock).mockResolvedValue(2);

                const result = await badgeService.getAllBadges({});

                expect(result.success).toBe(true);
                expect(result.data.badges).toHaveLength(2);
                expect(result.data.pagination.total).toBe(2);
            });

            it('devrait filtrer par rareté', async () => {
                (Badge.find as jest.Mock).mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        skip: jest.fn().mockReturnValue({
                            limit: jest.fn().mockReturnValue({
                                lean: jest.fn().mockResolvedValue([])
                            })
                        })
                    })
                });
                (Badge.countDocuments as jest.Mock).mockResolvedValue(0);

                await badgeService.getAllBadges({ rarity: 'rare' });

                expect(Badge.find).toHaveBeenCalledWith(
                    expect.objectContaining({ rarity: 'RARE' })
                );
            });

            it('devrait gérer la pagination correctement', async () => {
                (Badge.find as jest.Mock).mockReturnValue({
                    sort: jest.fn().mockReturnValue({
                        skip: jest.fn().mockReturnValue({
                            limit: jest.fn().mockReturnValue({
                                lean: jest.fn().mockResolvedValue([])
                            })
                        })
                    })
                });
                (Badge.countDocuments as jest.Mock).mockResolvedValue(100);

                const result = await badgeService.getAllBadges({ page: '2', limit: '20' });

                expect(result.data.pagination.page).toBe(2);
                expect(result.data.pagination.limit).toBe(20);
            });
        });

        describe('getBadgeById', () => {

            it('devrait retourner un badge par ID', async () => {
                const mockBadge = {
                    _id: 'b1',
                    badgeId: 'BADGE-001',
                    name: 'Test Badge',
                    rarity: 'EXOTIC'
                };

                (Badge.findOne as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockBadge)
                });

                const result = await badgeService.getBadgeById('BADGE-001');

                expect(result.success).toBe(true);
                expect(result.data.badge.name).toBe('Test Badge');
            });

            it('devrait retourner notFound si badge inexistant', async () => {
                (Badge.findOne as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue(null)
                });

                const result = await badgeService.getBadgeById('unknown');

                expect(result.success).toBe(false);
                expect(result.notFound).toBe(true);
            });

            it('devrait rejeter un ID vide', async () => {
                const result = await badgeService.getBadgeById('');

                expect(result.success).toBe(false);
                expect(result.error).toBe('Invalid badge ID');
            });
        });

        describe('getBadgeStats', () => {

            it('devrait retourner les statistiques des badges', async () => {
                (Badge.countDocuments as jest.Mock)
                    .mockResolvedValueOnce(100)  // total
                    .mockResolvedValueOnce(80)   // obtainable
                    .mockResolvedValueOnce(20);  // unobtainable

                (Badge.aggregate as jest.Mock).mockResolvedValue([
                    { _id: 'COMMON', count: 50 },
                    { _id: 'RARE', count: 30 },
                    { _id: 'EXOTIC', count: 20 }
                ]);

                const result = await badgeService.getBadgeStats();

                expect(result.success).toBe(true);
                expect(result.data.stats.total).toBe(100);
                expect(result.data.stats.obtainable).toBe(80);
                expect(result.data.stats.byRarity.COMMON).toBe(50);
            });
        });
    });

    // ============================================
    // ACTIONS FOUNDER (ADMIN)
    // ============================================
    describe('🔐 Actions Founder (Admin)', () => {

        describe('createBadge', () => {

            it('devrait créer un badge avec données valides', async () => {
                const badgeData = {
                    name: 'New Badge',
                    description: 'A new badge',
                    rarity: 'LEGENDARY',
                    icon: '/badges/new.png'
                };

                const mockSavedBadge = {
                    _id: 'new-badge-id',
                    badgeId: 'BADGE-001',
                    ...badgeData,
                    save: jest.fn().mockResolvedValue(true)
                };

                (Badge as any).mockImplementation(() => mockSavedBadge);

                const result = await badgeService.createBadge(badgeData);

                expect(result.success).toBe(true);
                expect(result.message).toBe('Badge created successfully');
            });

            it('devrait rejeter sans nom', async () => {
                const result = await badgeService.createBadge({
                    name: '',
                    description: 'No name'
                });

                expect(result.success).toBe(false);
                expect(result.error).toBe('Badge name is required');
            });

            it('devrait rejeter une rareté invalide', async () => {
                const result = await badgeService.createBadge({
                    name: 'Test Badge',
                    rarity: 'INVALID_RARITY'
                });

                expect(result.success).toBe(false);
                expect(result.error).toBe('Invalid rarity');
            });

            it('devrait vérifier l\'existence de la timeline liée', async () => {
                (Timeline.findOne as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue(null)
                });

                const result = await badgeService.createBadge({
                    name: 'Test Badge',
                    linkedTimeline: 'TL-NONEXISTENT'
                });

                expect(result.success).toBe(false);
                expect(result.error).toContain('Timeline');
            });
        });

        describe('updateBadge', () => {

            it('devrait mettre à jour un badge existant', async () => {
                const updatedBadge = {
                    _id: 'b1',
                    badgeId: 'BADGE-001',
                    name: 'Updated Name',
                    rarity: 'RARE'
                };

                (Badge.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedBadge);

                const result = await badgeService.updateBadge('BADGE-001', { name: 'Updated Name' });

                expect(result.success).toBe(true);
                expect(result.data.badge.name).toBe('Updated Name');
            });

            it('devrait retourner notFound si badge inexistant', async () => {
                (Badge.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

                const result = await badgeService.updateBadge('unknown', { name: 'Test' });

                expect(result.success).toBe(false);
                expect(result.notFound).toBe(true);
            });

            it('devrait rejeter un nom vide', async () => {
                const result = await badgeService.updateBadge('BADGE-001', { name: '' });

                expect(result.success).toBe(false);
                expect(result.error).toBe('Badge name cannot be empty');
            });
        });

        describe('deleteBadge', () => {

            it('devrait supprimer un badge', async () => {
                const deletedBadge = {
                    _id: 'b1',
                    badgeId: 'BADGE-001',
                    name: 'Deleted Badge'
                };

                (Badge.findOneAndDelete as jest.Mock).mockResolvedValue(deletedBadge);

                const result = await badgeService.deleteBadge('BADGE-001');

                expect(result.success).toBe(true);
                expect(result.message).toBe('Badge deleted successfully');
            });

            it('devrait retourner notFound si badge inexistant', async () => {
                (Badge.findOneAndDelete as jest.Mock).mockResolvedValue(null);

                const result = await badgeService.deleteBadge('unknown');

                expect(result.success).toBe(false);
                expect(result.notFound).toBe(true);
            });
        });

        describe('giftBadge', () => {

            it('devrait attribuer un badge à un agent', async () => {
                const mockBadge = {
                    _id: 'badge-mongo-id',
                    badgeId: 'BADGE-001',
                    name: 'Gift Badge',
                    rarity: 'RARE'
                };
                const mockAgent = {
                    _id: 'agent-id',
                    bungieId: '123456',
                    protocol: {
                        agentName: 'TestAgent',
                        badges: []
                    },
                    bungieUser: { uniqueName: 'TestUser#1234' },
                    save: jest.fn().mockResolvedValue(true)
                };

                (Badge.findOne as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockBadge)
                });
                mockFindAgentByIdentifier.mockResolvedValue(mockAgent as any);

                const result = await badgeService.giftBadge('BADGE-001', 'agent-id');

                expect(result.success).toBe(true);
                expect(result.message).toBe('Badge successfully gifted to agent');
                expect(mockAgent.save).toHaveBeenCalled();
            });

            it('devrait échouer si l\'agent a déjà le badge', async () => {
                const mockBadge = {
                    _id: { toString: () => 'badge-mongo-id' },
                    badgeId: 'BADGE-001',
                    name: 'Owned Badge'
                };
                const mockAgent = {
                    _id: 'agent-id',
                    protocol: {
                        agentName: 'TestAgent',
                        badges: [{
                            badgeId: { toString: () => 'badge-mongo-id' }
                        }]
                    }
                };

                (Badge.findOne as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockBadge)
                });
                mockFindAgentByIdentifier.mockResolvedValue(mockAgent as any);

                const result = await badgeService.giftBadge('BADGE-001', 'agent-id');

                expect(result.success).toBe(false);
                expect(result.alreadyHas).toBe(true);
            });

            it('devrait échouer si badge non trouvé', async () => {
                (Badge.findOne as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue(null)
                });

                const result = await badgeService.giftBadge('BADGE-UNKNOWN', 'agent-id');

                expect(result.success).toBe(false);
                expect(result.notFound).toBe(true);
            });

            it('devrait échouer si agent non trouvé', async () => {
                (Badge.findOne as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue({ _id: 'badge-id', name: 'Badge' })
                });
                mockFindAgentByIdentifier.mockResolvedValue(null);

                const result = await badgeService.giftBadge('BADGE-001', 'unknown-agent');

                expect(result.success).toBe(false);
                expect(result.notFound).toBe(true);
            });
        });

        describe('revokeBadge', () => {

            it('devrait retirer un badge d\'un agent', async () => {
                const mockBadge = {
                    _id: { toString: () => 'badge-mongo-id' },
                    badgeId: 'BADGE-001',
                    name: 'Badge to Revoke',
                    rarity: 'COMMON'
                };
                const mockAgent = {
                    _id: 'agent-id',
                    bungieId: '123456',
                    protocol: {
                        agentName: 'TestAgent',
                        badges: [{
                            badgeId: { toString: () => 'badge-mongo-id' },
                            obtainedAt: new Date()
                        }]
                    },
                    save: jest.fn().mockResolvedValue(true)
                };

                (Badge.findOne as jest.Mock).mockResolvedValue(mockBadge);
                mockFindAgentByIdentifier.mockResolvedValue(mockAgent as any);

                const result = await badgeService.revokeBadge('BADGE-001', 'agent-id');

                expect(result.success).toBe(true);
                expect(result.message).toBe('Badge successfully revoked from agent');
            });

            it('devrait échouer si l\'agent n\'a pas le badge', async () => {
                const mockBadge = {
                    _id: { toString: () => 'badge-mongo-id' },
                    name: 'Badge'
                };
                const mockAgent = {
                    _id: 'agent-id',
                    protocol: {
                        agentName: 'TestAgent',
                        badges: []
                    }
                };

                (Badge.findOne as jest.Mock).mockResolvedValue(mockBadge);
                mockFindAgentByIdentifier.mockResolvedValue(mockAgent as any);

                const result = await badgeService.revokeBadge('BADGE-001', 'agent-id');

                expect(result.success).toBe(false);
                expect(result.notHasBadge).toBe(true);
            });
        });

        describe('giftBadgeBatch', () => {

            it('devrait attribuer un badge à plusieurs agents', async () => {
                const mockBadge = {
                    _id: { toString: () => 'badge-id' },
                    badgeId: 'BADGE-001',
                    name: 'Batch Badge',
                    rarity: 'UNCOMMON'
                };

                (Badge.findOne as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockBadge)
                });

                // Mock pour chaque appel à giftBadge interne
                const createMockAgent = () => ({
                    _id: 'agent-id',
                    bungieId: '123456',
                    protocol: {
                        agentName: 'TestAgent',
                        badges: []
                    },
                    bungieUser: { uniqueName: 'Test#1234' },
                    save: jest.fn().mockResolvedValue(true)
                });

                mockFindAgentByIdentifier
                    .mockResolvedValueOnce(createMockAgent() as any)
                    .mockResolvedValueOnce(createMockAgent() as any);

                const result = await badgeService.giftBadgeBatch('BADGE-001', ['agent-1', 'agent-2']);

                expect(result.success).toBe(true);
                expect(result.data.stats.succeeded).toBe(2);
            });

            it('devrait rejeter si tableau d\'agents vide', async () => {
                const result = await badgeService.giftBadgeBatch('BADGE-001', []);

                expect(result.success).toBe(false);
                expect(result.error).toBe('Agent IDs array is required');
            });
        });

        describe('giftBadgesToAgent', () => {

            it('devrait attribuer plusieurs badges à un agent', async () => {
                const mockAgent = {
                    _id: 'agent-id',
                    bungieId: '123456',
                    protocol: {
                        agentName: 'TestAgent',
                        badges: []
                    },
                    bungieUser: { uniqueName: 'Test#1234' },
                    save: jest.fn().mockResolvedValue(true)
                };

                mockFindAgentByIdentifier.mockResolvedValue(mockAgent as any);
                (Badge.findOne as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue({
                        _id: { toString: () => 'badge-id' },
                        badgeId: 'BADGE-001',
                        name: 'Badge',
                        rarity: 'COMMON'
                    })
                });

                const result = await badgeService.giftBadgesToAgent('agent-id', ['badge-1', 'badge-2']);

                expect(result.success).toBe(true);
            });

            it('devrait échouer si agent non trouvé', async () => {
                mockFindAgentByIdentifier.mockResolvedValue(null);

                const result = await badgeService.giftBadgesToAgent('unknown-agent', ['badge-1']);

                expect(result.success).toBe(false);
                expect(result.notFound).toBe(true);
            });
        });
    });

    // ============================================
    // GESTION DES ERREURS
    // ============================================
    describe('🚨 Gestion des erreurs', () => {

        it('devrait propager les erreurs de base de données', async () => {
            (Badge.find as jest.Mock).mockReturnValue({
                sort: jest.fn().mockReturnValue({
                    skip: jest.fn().mockReturnValue({
                        limit: jest.fn().mockReturnValue({
                            lean: jest.fn().mockRejectedValue(new Error('DB Error'))
                        })
                    })
                })
            });

            await expect(badgeService.getAllBadges({})).rejects.toThrow('DB Error');
        });
    });
});
