/**
 * Configuration et helpers pour les tests d'intégration
 * @file setup.ts
 */

import { Response } from 'express';

// ============================================
// MOCK JWT TOKENS
// ============================================

export const TEST_TOKENS = {
    // Token valide pour un agent normal
    AGENT: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiNjVhMWIyYzNkNGU1ZjYwMDAxMjM0NTY3IiwiYnVuZ2llSWQiOiIxMjM0NTY3ODkwIiwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjI1MjQ2MDgwMDB9.mock_signature',

    // Token valide pour un fondateur (admin)
    FOUNDER: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiNjVhMWIyYzNkNGU1ZjYwMDAxMjM0NTY4IiwiYnVuZ2llSWQiOiI5ODc2NTQzMjEwIiwiaWF0IjoxNzA0MDY3MjAwLCJleHAiOjI1MjQ2MDgwMDB9.mock_signature',

    // Token expiré
    EXPIRED: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhZ2VudElkIjoiZXhwaXJlZCIsImJ1bmdpZUlkIjoiMTIzIiwiaWF0IjoxNjAwMDAwMDAwLCJleHAiOjE2MDAwMDAwMDF9.expired',

    // Token invalide
    INVALID: 'invalid.token.here'
};

// ============================================
// MOCK DATA FACTORIES
// ============================================

export const createMockAgent = (overrides = {}) => ({
    _id: '65a1b2c3d4e5f60001234567',
    bungieId: '1234567890',
    protocol: {
        agentName: 'TestAgent',
        customName: null,
        species: 'HUMAN',
        roles: ['AGENT'],
        clearanceLevel: 1,
        hasSeenRecruitment: true,
        protocolJoinedAt: new Date('2024-01-01'),
        division: 'PROTOCOL',
        settings: {
            notifications: true,
            publicProfile: true,
            protocolOSTheme: 'DEFAULT',
            protocolSounds: true,
            language: 'fr'
        },
        badges: [],
        stats: {
            completedTimelines: 0,
            fragmentsCollected: 0
        }
    },
    isActive: true,
    lastActivity: new Date(),
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    ...overrides
});

export const createMockFounder = (overrides = {}) => ({
    ...createMockAgent(),
    _id: '65a1b2c3d4e5f60001234568',
    bungieId: '9876543210',
    protocol: {
        ...createMockAgent().protocol,
        agentName: 'TestFounder',
        roles: ['FOUNDER', 'AGENT'],
        clearanceLevel: 10
    },
    ...overrides
});

export const createMockTimeline = (overrides = {}) => ({
    _id: '65a1b2c3d4e5f60001234569',
    timelineId: 'TIMELINE-20240101-abc123',
    name: 'Test Timeline',
    description: 'A test timeline for unit tests',
    tier: 1,
    isShared: false,
    status: 'OPEN',
    entries: [],
    emblemId: ['test-emblem'],
    stateFlags: {
        isDraft: false,
        isDeleted: false,
        isOpen: true,
        isProgress: false,
        isClosed: false,
        isCompleted: false,
        isArchived: false,
        isStabilized: false
    },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    ...overrides
});

export const createMockContract = (overrides = {}) => ({
    _id: '65a1b2c3d4e5f6000123456a',
    contractId: 'CONTRACT-20240101-def456',
    status: 'PENDING',
    createdBy: '1234567890',
    emblems: [
        {
            emblemId: 'EMBLEM-001',
            name: 'Test Emblem',
            codes: ['CODE1', 'CODE2'],
            status: 'PENDING'
        }
    ],
    contributors: [
        {
            bungieId: '1234567890',
            role: 'DONOR'
        }
    ],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date(),
    ...overrides
});

export const createMockBadge = (overrides = {}) => ({
    _id: '65a1b2c3d4e5f6000123456b',
    badgeId: 'BADGE-20240101-ghi789',
    name: 'Test Badge',
    description: 'A test badge',
    rarity: 'COMMON',
    icon: '/badges/test.png',
    obtainable: true,
    createdAt: new Date('2024-01-01'),
    ...overrides
});

export const createMockAnnouncement = (overrides = {}) => ({
    _id: '65a1b2c3d4e5f6000123456c',
    announcementId: 'ANN-20240101-jkl012',
    title: 'Test Announcement',
    content: 'This is a test announcement',
    type: 'INFO',
    isActive: true,
    priority: 'NORMAL',
    createdBy: '9876543210',
    createdAt: new Date('2024-01-01'),
    ...overrides
});

export const createMockLore = (overrides = {}) => ({
    _id: '65a1b2c3d4e5f6000123456d',
    loreId: 'LORE-20240101-mno345',
    title: 'Test Lore Entry',
    content: 'Once upon a time in the Protocol...',
    category: 'HISTORY',
    isLocked: true,
    linkedTimeline: null,
    createdAt: new Date('2024-01-01'),
    ...overrides
});

export const createMockRewardCode = (overrides = {}) => ({
    _id: '65a1b2c3d4e5f6000123456e',
    code: 'REWARD-ABC123',
    type: 'BADGE',
    rewardId: '65a1b2c3d4e5f6000123456b',
    isRedeemed: false,
    maxUses: 1,
    currentUses: 0,
    expiresAt: new Date('2025-12-31'),
    createdBy: '9876543210',
    createdAt: new Date('2024-01-01'),
    ...overrides
});

export const createMockRole = (overrides = {}) => ({
    _id: '65a1b2c3d4e5f6000123456f',
    name: 'EXPLORER',
    displayName: 'Explorer',
    description: 'An agent who explores timelines',
    color: '#3498db',
    permissions: ['READ_TIMELINES', 'INTERACT_TIMELINES'],
    isSystem: false,
    order: 10,
    createdAt: new Date('2024-01-01'),
    ...overrides
});

export const createMockDivision = (overrides = {}) => ({
    _id: '65a1b2c3d4e5f60001234570',
    name: 'ALPHA',
    displayName: 'Division Alpha',
    description: 'The first division',
    leaderId: null,
    memberCount: 0,
    isSystem: false,
    createdAt: new Date('2024-01-01'),
    ...overrides
});

// ============================================
// MOCK EXPRESS RESPONSE
// ============================================

export const createMockResponse = (): {
    status: jest.Mock;
    json: jest.Mock;
    statusCode: number;
    jsonData: any;
} => {
    const res: any = {
        statusCode: 200,
        jsonData: null
    };

    res.status = jest.fn((code: number) => {
        res.statusCode = code;
        return res;
    });

    res.json = jest.fn((data: any) => {
        res.jsonData = data;
        return res;
    });

    return res;
};

// ============================================
// MOCK EXPRESS REQUEST
// ============================================

export const createMockRequest = (overrides: any = {}) => ({
    headers: {},
    params: {},
    query: {},
    body: {},
    user: undefined,
    ip: '127.0.0.1',
    get: jest.fn((header: string) => overrides.headers?.[header]),
    ...overrides
});

// ============================================
// TEST UTILITIES
// ============================================

/**
 * Crée une requête authentifiée pour un agent
 */
export const createAgentRequest = (overrides: any = {}) => createMockRequest({
    headers: {
        authorization: `Bearer ${TEST_TOKENS.AGENT}`,
        ...overrides.headers
    },
    user: {
        agentId: '65a1b2c3d4e5f60001234567',
        bungieId: '1234567890',
        protocol: {
            agentName: 'TestAgent',
            roles: ['AGENT'],
            clearanceLevel: 1
        }
    },
    ...overrides
});

/**
 * Crée une requête authentifiée pour un fondateur
 */
export const createFounderRequest = (overrides: any = {}) => createMockRequest({
    headers: {
        authorization: `Bearer ${TEST_TOKENS.FOUNDER}`,
        ...overrides.headers
    },
    user: {
        agentId: '65a1b2c3d4e5f60001234568',
        bungieId: '9876543210',
        protocol: {
            agentName: 'TestFounder',
            roles: ['FOUNDER', 'AGENT'],
            clearanceLevel: 10
        }
    },
    ...overrides
});

/**
 * Crée une requête non authentifiée
 */
export const createUnauthenticatedRequest = (overrides: any = {}) => createMockRequest({
    headers: {},
    user: undefined,
    ...overrides
});

// ============================================
// ASSERTIONS HELPERS
// ============================================

/**
 * Vérifie qu'une réponse a le format standard de succès
 */
export const expectSuccessResponse = (res: any) => {
    expect(res.statusCode).toBe(200);
    expect(res.jsonData.success).toBe(true);
    expect(res.jsonData.timestamp).toBeDefined();
};

/**
 * Vérifie qu'une réponse 401 Unauthorized
 */
export const expectUnauthorizedResponse = (res: any) => {
    expect(res.statusCode).toBe(401);
    expect(res.jsonData.success).toBe(false);
};

/**
 * Vérifie qu'une réponse 403 Forbidden
 */
export const expectForbiddenResponse = (res: any) => {
    expect(res.statusCode).toBe(403);
    expect(res.jsonData.success).toBe(false);
};

/**
 * Vérifie qu'une réponse 404 Not Found
 */
export const expectNotFoundResponse = (res: any) => {
    expect(res.statusCode).toBe(404);
    expect(res.jsonData.success).toBe(false);
};

/**
 * Vérifie qu'une réponse 400 Bad Request
 */
export const expectBadRequestResponse = (res: any) => {
    expect(res.statusCode).toBe(400);
    expect(res.jsonData.success).toBe(false);
};

// ============================================
// MONGODB MOCK HELPERS
// ============================================

export const mockMongooseModel = (mockData: any[] = []) => ({
    find: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockData),
        sort: jest.fn().mockReturnThis(),
        skip: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData)
    }),
    findOne: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockData[0] || null),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData[0] || null)
    }),
    findById: jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(mockData[0] || null),
        select: jest.fn().mockReturnThis(),
        populate: jest.fn().mockReturnThis(),
        exec: jest.fn().mockResolvedValue(mockData[0] || null)
    }),
    findByIdAndUpdate: jest.fn().mockResolvedValue(mockData[0] || null),
    findByIdAndDelete: jest.fn().mockResolvedValue(mockData[0] || null),
    findOneAndUpdate: jest.fn().mockResolvedValue(mockData[0] || null),
    findOneAndDelete: jest.fn().mockResolvedValue(mockData[0] || null),
    create: jest.fn().mockImplementation((data) => Promise.resolve({ _id: 'new-id', ...data })),
    countDocuments: jest.fn().mockResolvedValue(mockData.length),
    aggregate: jest.fn().mockResolvedValue([]),
    updateOne: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    updateMany: jest.fn().mockResolvedValue({ modifiedCount: mockData.length }),
    deleteOne: jest.fn().mockResolvedValue({ deletedCount: 1 }),
    deleteMany: jest.fn().mockResolvedValue({ deletedCount: mockData.length })
});

// ============================================
// CONSOLE MOCK (pour éviter les logs pendant les tests)
// ============================================

export const mockConsole = () => {
    const originalConsole = { ...console };

    beforeAll(() => {
        console.log = jest.fn();
        console.warn = jest.fn();
        console.error = jest.fn();
    });

    afterAll(() => {
        console.log = originalConsole.log;
        console.warn = originalConsole.warn;
        console.error = originalConsole.error;
    });

    return originalConsole;
};
