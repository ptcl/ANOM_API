/**
 * Tests complets pour le service Timeline
 * @file timeline.service.test.ts
 * 
 * Adapté à l'implémentation réelle du TimelineService
 */

import { TimelineService } from '../../services/timeline.service';
import { Timeline } from '../../models/timeline.model';
import { Agent } from '../../models/agent.model';
import { EmblemModel } from '../../models/emblem.model';

// Mock tous les modèles Mongoose
jest.mock('../../models/timeline.model');
jest.mock('../../models/agent.model');
jest.mock('../../models/emblem.model');
jest.mock('../../models/lore.model');
jest.mock('../../models/badge.model');
jest.mock('../../utils/logger', () => ({
    __esModule: true,
    default: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        http: jest.fn()
    },
    createContextLogger: jest.fn(() => ({
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
        http: jest.fn()
    }))
}));

describe('TimelineService', () => {
    let timelineService: TimelineService;

    beforeEach(() => {
        jest.clearAllMocks();
        timelineService = new TimelineService();
    });

    // ============================================
    // ACTIONS FOUNDER (ADMIN)
    // ============================================
    describe('🔐 Actions Founder (Admin)', () => {

        describe('createTimeline', () => {

            it('devrait créer une timeline sans emblème', async () => {
                const timelineData = {
                    name: 'Timeline sans emblème',
                    description: 'Test'
                };

                (Timeline.create as jest.Mock).mockResolvedValue({
                    _id: 'new-id',
                    ...timelineData
                });

                const result = await timelineService.createTimeline(timelineData);

                expect(result.success).toBe(true);
                expect(result.timeline).toBeDefined();
                expect(EmblemModel.find).not.toHaveBeenCalled();
            });

            it('devrait créer une timeline avec emblème existant', async () => {
                const timelineData = {
                    name: 'Test Timeline',
                    description: 'Description de test',
                    tier: 1 as 1 | 2 | 3 | 4 | 5,
                    emblemId: ['EMB-001']
                };

                const mockEmblem = {
                    emblemId: 'EMB-001',
                    code: 'ABC-DEF-GHI'
                };

                (EmblemModel.find as jest.Mock).mockResolvedValue([mockEmblem]);
                (Timeline.create as jest.Mock).mockResolvedValue({
                    _id: 'new-timeline-id',
                    ...timelineData,
                    code: {
                        targetCode: ['ABC', 'DEF', 'GHI'],
                        pattern: {}
                    }
                });

                const result = await timelineService.createTimeline(timelineData);

                expect(result.success).toBe(true);
                expect(result.timeline).toBeDefined();
                expect(Timeline.create).toHaveBeenCalled();
            });

            it('devrait échouer si un emblème n\'existe pas', async () => {
                const timelineData = {
                    name: 'Test',
                    emblemId: ['EMB-001', 'EMB-MISSING']
                };

                (EmblemModel.find as jest.Mock).mockResolvedValue([
                    { emblemId: 'EMB-001' }
                ]);

                const result = await timelineService.createTimeline(timelineData);

                expect(result.success).toBe(false);
                expect(result.message).toContain('EMB-MISSING');
            });
        });

        describe('getAllTimelines', () => {

            it('devrait retourner toutes les timelines', async () => {
                const mockTimelines = [
                    { timelineId: 'TL-001', name: 'Timeline 1' },
                    { timelineId: 'TL-002', name: 'Timeline 2' }
                ];

                (Timeline.find as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockTimelines)
                });

                const result = await timelineService.getAllTimelines();

                expect(result.success).toBe(true);
                expect(result.timelines).toHaveLength(2);
                expect(result.count).toBe(2);
            });

            it('devrait retourner un tableau vide si aucune timeline', async () => {
                (Timeline.find as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue([])
                });

                const result = await timelineService.getAllTimelines();

                expect(result.success).toBe(true);
                expect(result.timelines).toHaveLength(0);
                expect(result.count).toBe(0);
            });
        });

        describe('getTimelineById', () => {

            it('devrait retourner une timeline par ID', async () => {
                const mockTimeline = {
                    timelineId: 'TL-001',
                    name: 'Test Timeline',
                    tier: 2
                };

                (Timeline.findOne as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockTimeline)
                });

                const result = await timelineService.getTimelineById('TL-001');

                expect(result.success).toBe(true);
                expect(result.timeline.name).toBe('Test Timeline');
            });

            it('devrait échouer si timeline non trouvée', async () => {
                (Timeline.findOne as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue(null)
                });

                const result = await timelineService.getTimelineById('TL-UNKNOWN');

                expect(result.success).toBe(false);
                expect(result.message).toBe('Timeline non trouvée');
            });
        });

        describe('updateTimeline', () => {

            it('devrait mettre à jour une timeline', async () => {
                const updatedTimeline = {
                    timelineId: 'TL-001',
                    name: 'Updated Name',
                    tier: 3
                };

                (Timeline.findOneAndUpdate as jest.Mock).mockResolvedValue(updatedTimeline);

                const result = await timelineService.updateTimeline('TL-001', { name: 'Updated Name', tier: 3 });

                expect(result.success).toBe(true);
                expect(result.timeline.name).toBe('Updated Name');
            });

            it('devrait échouer si timeline non trouvée', async () => {
                (Timeline.findOneAndUpdate as jest.Mock).mockResolvedValue(null);

                const result = await timelineService.updateTimeline('TL-UNKNOWN', { name: 'Test' });

                expect(result.success).toBe(false);
                expect(result.message).toBe('Timeline non trouvée');
            });
        });

        describe('deleteTimeline', () => {

            it('devrait supprimer une timeline', async () => {
                (Timeline.findOneAndDelete as jest.Mock).mockResolvedValue({
                    timelineId: 'TL-001'
                });

                const result = await timelineService.deleteTimeline('TL-001');

                expect(result.success).toBe(true);
                expect(result.message).toBe('Timeline supprimée avec succès');
            });

            it('devrait échouer si timeline non trouvée', async () => {
                (Timeline.findOneAndDelete as jest.Mock).mockResolvedValue(null);

                const result = await timelineService.deleteTimeline('TL-UNKNOWN');

                expect(result.success).toBe(false);
                expect(result.message).toBe('Timeline non trouvée');
            });
        });
    });

    // ============================================
    // ACTIONS AGENT (PUBLIC)
    // ============================================
    describe('👤 Actions Agent', () => {

        describe('getAvailableTimelines', () => {

            it('devrait retourner uniquement les timelines ouvertes', async () => {
                const mockTimelines = [
                    { timelineId: 'TL-001', name: 'Open Timeline' }
                ];

                (Timeline.find as jest.Mock).mockReturnValue({
                    select: jest.fn().mockReturnValue({
                        lean: jest.fn().mockResolvedValue(mockTimelines)
                    })
                });

                const result = await timelineService.getAvailableTimelines();

                expect(result.success).toBe(true);
                expect(result.timelines).toHaveLength(1);
                expect(result.count).toBe(1);
                expect(Timeline.find).toHaveBeenCalledWith({
                    status: 'OPEN',
                    'stateFlags.isDeleted': false
                });
            });
        });

        describe('goHome', () => {

            it('devrait réinitialiser la localisation de l\'agent', async () => {
                (Agent.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

                const result = await timelineService.goHome('agent-123');

                expect(result.success).toBe(true);
                expect(result.type).toBe('NAVIGATION');
                expect(result.action).toBe('ROOT');
                expect(result.message).toBe('Retour au dashboard');
            });
        });

        describe('goBack', () => {

            it('devrait retourner à la timeline depuis une entry', async () => {
                (Agent.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

                const result = await timelineService.goBack('agent-123', {
                    timelineId: 'TL-001',
                    entryId: 'ENTRY-001'
                });

                expect(result.success).toBe(true);
                expect(result.action).toBe('BACK_TO_TIMELINE');
                expect(result.message).toBe('Retour à la timeline');
            });

            it('devrait retourner au dashboard depuis une timeline', async () => {
                (Agent.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

                const result = await timelineService.goBack('agent-123', {
                    timelineId: 'TL-001'
                });

                expect(result.success).toBe(true);
                expect(result.action).toBe('BACK_TO_ROOT');
                expect(result.message).toBe('Retour au dashboard');
            });

            it('devrait indiquer qu\'on est déjà au dashboard', async () => {
                const result = await timelineService.goBack('agent-123', {});

                expect(result.success).toBe(false);
                expect(result.action).toBe('ALREADY_AT_ROOT');
                expect(result.message).toBe('Vous êtes déjà au dashboard');
            });
        });

        describe('getAgentTimelineProgress', () => {

            it('devrait retourner la progression de l\'agent', async () => {
                const mockTimeline = {
                    timelineId: 'TL-001',
                    name: 'Test Timeline',
                    description: 'Description',
                    tier: 1,
                    status: 'OPEN',
                    emblemId: ['EMB-001'],
                    code: {
                        pattern: {
                            AAA: { A1: 'X', A2: 'Y', A3: 'Z' }
                        },
                        targetCode: ['XYZ']
                    }
                };

                const mockAgent = {
                    _id: 'agent-123',
                    timelines: [{
                        timelineId: 'TL-001',
                        fragmentsFound: ['A1'],
                        fragmentsCollected: 1,
                        keysFound: [],
                        entriesResolved: [],
                        completed: false
                    }]
                };

                (Timeline.findOne as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockTimeline)
                });
                (Agent.findById as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue(mockAgent)
                });

                const result = await timelineService.getAgentTimelineProgress('agent-123', 'TL-001');

                expect(result.success).toBe(true);
                expect(result.timeline.name).toBe('Test Timeline');
                expect(result.progress.fragmentsFound).toContain('A1');
                expect(result.emblemProgress).toBeDefined();
            });

            it('devrait échouer si timeline non trouvée', async () => {
                (Timeline.findOne as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue(null)
                });

                const result = await timelineService.getAgentTimelineProgress('agent-123', 'TL-UNKNOWN');

                expect(result.success).toBe(false);
                expect(result.message).toBe('Timeline non trouvée');
            });

            it('devrait échouer si agent non trouvé', async () => {
                (Timeline.findOne as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue({ timelineId: 'TL-001' })
                });
                (Agent.findById as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue(null)
                });

                const result = await timelineService.getAgentTimelineProgress('agent-unknown', 'TL-001');

                expect(result.success).toBe(false);
                expect(result.message).toBe('Agent non trouvé');
            });

            it('devrait échouer si agent n\'a pas accès à la timeline', async () => {
                (Timeline.findOne as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue({ timelineId: 'TL-001' })
                });
                (Agent.findById as jest.Mock).mockReturnValue({
                    lean: jest.fn().mockResolvedValue({
                        _id: 'agent-123',
                        timelines: []
                    })
                });

                const result = await timelineService.getAgentTimelineProgress('agent-123', 'TL-001');

                expect(result.success).toBe(false);
                expect(result.message).toBe("Vous n'avez pas accès à cette timeline");
            });
        });

        describe('processInteraction', () => {

            it('devrait accéder à une timeline avec le bon code', async () => {
                const mockTimeline = {
                    _id: 'tl-mongo-id',
                    timelineId: 'TL-001',
                    name: 'Secret Timeline',
                    description: 'Test',
                    tier: 1,
                    status: 'OPEN',
                    securityProtocol: {
                        accessCode: 'SECRET123'
                    },
                    code: { format: 'AAA-BBB-CCC' },
                    participants: [],
                    save: jest.fn().mockResolvedValue(true)
                };

                const mockAgent = {
                    _id: 'agent-123',
                    bungieId: '123456',
                    timelines: [],
                    lastActivity: null,
                    save: jest.fn().mockResolvedValue(true)
                };

                (Timeline.findOne as jest.Mock).mockResolvedValue(mockTimeline);
                (Agent.findById as jest.Mock).mockResolvedValue(mockAgent);
                (Agent.findByIdAndUpdate as jest.Mock).mockResolvedValue({});

                const result = await timelineService.processInteraction('agent-123', 'SECRET123', {});

                expect(result.success).toBe(true);
                expect(result.type).toBe('TIMELINE_ACCESS');
                expect(result.data.timeline.name).toBe('Secret Timeline');
            });

            it('devrait échouer avec un mauvais code', async () => {
                (Timeline.findOne as jest.Mock).mockResolvedValue(null);

                const result = await timelineService.processInteraction('agent-123', 'WRONGCODE', {});

                expect(result.success).toBe(false);
                expect(result.message).toBe('Code invalide ou commande inconnue');
            });
        });
    });

    // ============================================
    // GESTION DES ERREURS
    // ============================================
    describe('🚨 Gestion des erreurs', () => {

        it('createTimeline devrait lever une erreur en cas d\'échec DB', async () => {
            (EmblemModel.find as jest.Mock).mockRejectedValue(new Error('DB Error'));

            await expect(timelineService.createTimeline({ name: 'Test', emblemId: ['EMB-001'] }))
                .rejects.toThrow('Erreur lors de la création de la timeline');
        });

        it('getAllTimelines devrait lever une erreur en cas d\'échec DB', async () => {
            (Timeline.find as jest.Mock).mockReturnValue({
                lean: jest.fn().mockRejectedValue(new Error('DB Error'))
            });

            await expect(timelineService.getAllTimelines())
                .rejects.toThrow('Erreur lors de la récupération des timelines');
        });

        it('getTimelineById devrait lever une erreur en cas d\'échec DB', async () => {
            (Timeline.findOne as jest.Mock).mockReturnValue({
                lean: jest.fn().mockRejectedValue(new Error('DB Error'))
            });

            await expect(timelineService.getTimelineById('TL-001'))
                .rejects.toThrow('Erreur lors de la récupération');
        });
    });
});
