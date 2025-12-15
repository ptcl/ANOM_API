/**
 * Tests unitaires pour les fonctions d'authentification
 * @file auth.test.ts
 */

import {
    generateState,
    generateJWT,
    verifyJWT,
    validateJWTFormat
} from '../../utils/auth';

// Mock de process.env pour les tests
const originalEnv = process.env;

describe('Auth Utils', () => {

    beforeAll(() => {
        // Configure un JWT_SECRET pour les tests
        process.env = {
            ...originalEnv,
            JWT_SECRET: 'test-secret-key-for-unit-testing-minimum-32-chars'
        };
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    // ============================================
    // generateState
    // ============================================
    describe('generateState', () => {

        it('devrait générer une chaîne hexadécimale', () => {
            const state = generateState();
            expect(state).toMatch(/^[a-f0-9]+$/);
        });

        it('devrait générer une chaîne de 64 caractères (32 bytes)', () => {
            const state = generateState();
            expect(state).toHaveLength(64);
        });

        it('devrait générer des valeurs uniques', () => {
            const state1 = generateState();
            const state2 = generateState();
            expect(state1).not.toBe(state2);
        });

        it('devrait être suffisamment aléatoire (10 générations uniques)', () => {
            const states = new Set();
            for (let i = 0; i < 10; i++) {
                states.add(generateState());
            }
            expect(states.size).toBe(10);
        });
    });

    // ============================================
    // generateJWT
    // ============================================
    describe('generateJWT', () => {

        it('devrait générer un token JWT valide', () => {
            const payload = { agentId: '123', bungieId: '456' };
            const token = generateJWT(payload);

            expect(typeof token).toBe('string');
            expect(token.split('.')).toHaveLength(3); // header.payload.signature
        });

        it('devrait générer un token avec expiration par défaut', () => {
            const payload = { test: 'data' };
            const token = generateJWT(payload);
            const decoded = verifyJWT(token);

            expect(decoded).toHaveProperty('exp');
            expect(decoded).toHaveProperty('iat');
        });

        it('devrait respecter l\'expiration personnalisée', () => {
            const payload = { test: 'data' };
            const token = generateJWT(payload, '1h');
            const decoded = verifyJWT(token);

            // L'expiration devrait être environ 1 heure après l'émission
            const expDiff = decoded.exp - decoded.iat;
            expect(expDiff).toBe(3600); // 1 heure en secondes
        });

        it('devrait inclure le payload dans le token', () => {
            const payload = { agentId: 'test-123', bungieId: 'bungie-456' };
            const token = generateJWT(payload);
            const decoded = verifyJWT(token);

            expect(decoded.agentId).toBe('test-123');
            expect(decoded.bungieId).toBe('bungie-456');
        });
    });

    // ============================================
    // verifyJWT
    // ============================================
    describe('verifyJWT', () => {

        it('devrait vérifier un token valide', () => {
            const payload = { userId: 'test' };
            const token = generateJWT(payload);
            const decoded = verifyJWT(token);

            expect(decoded.userId).toBe('test');
        });

        it('devrait lever une erreur pour un token invalide', () => {
            expect(() => verifyJWT('invalid.token.here'))
                .toThrow('TOKEN_INVALID');
        });

        it('devrait lever une erreur pour un token mal formé', () => {
            expect(() => verifyJWT('not-a-jwt'))
                .toThrow();
        });

        it('devrait lever une erreur pour un token expiré', async () => {
            // Crée un token qui expire immédiatement
            const payload = { test: 'expired' };
            const token = generateJWT(payload, '0s');

            // Attend un peu pour que le token expire
            await new Promise(resolve => setTimeout(resolve, 100));

            expect(() => verifyJWT(token)).toThrow('TOKEN_EXPIRED');
        });
    });

    // ============================================
    // validateJWTFormat
    // ============================================
    describe('validateJWTFormat', () => {

        it('devrait valider un format JWT correct', () => {
            const token = generateJWT({ test: 'data' });
            const result = validateJWTFormat(token);

            expect(result.valid).toBe(true);
            expect(result.message).toBe('Token valide');
        });

        it('devrait rejeter un token vide', () => {
            const result = validateJWTFormat('');

            expect(result.valid).toBe(false);
            expect(result.error).toBe('missing_token');
        });

        it('devrait rejeter null', () => {
            const result = validateJWTFormat(null as any);

            expect(result.valid).toBe(false);
            expect(result.error).toBe('missing_token');
        });

        it('devrait rejeter un token sans points', () => {
            const result = validateJWTFormat('tokenwithoutspoints');

            expect(result.valid).toBe(false);
            expect(result.error).toBe('invalid_token_format');
        });

        it('devrait rejeter un token avec seulement 2 parties', () => {
            const result = validateJWTFormat('part1.part2');

            expect(result.valid).toBe(false);
            expect(result.error).toBe('invalid_token_format');
        });

        it('devrait rejeter un token trop long', () => {
            const longToken = 'a'.repeat(3000) + '.' + 'b'.repeat(100) + '.' + 'c'.repeat(100);
            const result = validateJWTFormat(longToken);

            expect(result.valid).toBe(false);
            expect(result.error).toBe('invalid_token_length');
        });

        it('devrait accepter un token avec exactement 3 parties', () => {
            const result = validateJWTFormat('header.payload.signature');

            expect(result.valid).toBe(true);
        });
    });

    // ============================================
    // Tests d'intégration
    // ============================================
    describe('Intégration Auth', () => {

        it('devrait pouvoir créer et vérifier un cycle complet', () => {
            const originalPayload = {
                agentId: 'agent-001',
                bungieId: 'bungie-12345',
                roles: ['AGENT', 'EXPLORER']
            };

            // Étape 1: Générer le token
            const token = generateJWT(originalPayload);

            // Étape 2: Valider le format
            const formatValidation = validateJWTFormat(token);
            expect(formatValidation.valid).toBe(true);

            // Étape 3: Vérifier et décoder
            const decoded = verifyJWT(token);

            // Étape 4: Vérifier le contenu
            expect(decoded.agentId).toBe(originalPayload.agentId);
            expect(decoded.bungieId).toBe(originalPayload.bungieId);
            expect(decoded.roles).toEqual(originalPayload.roles);
        });
    });
});
