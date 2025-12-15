/**
 * Tests unitaires pour la génération d'identifiants uniques
 * @file generate.test.ts
 */

import { generateUniqueId } from '../../utils/generate';

describe('Generate Utils', () => {

    // ============================================
    // generateUniqueId
    // ============================================
    describe('generateUniqueId', () => {

        it('devrait générer un ID avec le préfixe par défaut', () => {
            const id = generateUniqueId();
            expect(id.startsWith('ANN-')).toBe(true);
        });

        it('devrait générer un ID avec un préfixe personnalisé', () => {
            const id = generateUniqueId('ENTRY');
            expect(id.startsWith('ENTRY-')).toBe(true);
        });

        it('devrait inclure la date au format YYYYMMDD', () => {
            const id = generateUniqueId('TEST');
            const datePattern = /TEST-\d{8}-[a-f0-9]{6}/;
            expect(id).toMatch(datePattern);
        });

        it('devrait générer un ID de longueur cohérente', () => {
            const id = generateUniqueId('PRE');
            // PRE-YYYYMMDD-XXXXXX = 3 + 1 + 8 + 1 + 6 = 19 caractères
            expect(id).toHaveLength(19);
        });

        it('devrait contenir une partie hexadécimale aléatoire', () => {
            const id = generateUniqueId('TEST');
            const parts = id.split('-');
            const randomPart = parts[2];

            expect(randomPart).toMatch(/^[a-f0-9]{6}$/);
        });

        it('devrait générer des IDs uniques', () => {
            const ids = new Set();
            for (let i = 0; i < 100; i++) {
                ids.add(generateUniqueId('UNIQUE'));
            }
            expect(ids.size).toBe(100);
        });

        it('devrait inclure la date du jour', () => {
            const today = new Date();
            const expectedDateStr = today.toISOString().slice(0, 10).replace(/-/g, '');
            const id = generateUniqueId('DATE');

            expect(id).toContain(expectedDateStr);
        });

        it('devrait fonctionner avec différents préfixes', () => {
            const prefixes = ['AGENT', 'CONTRACT', 'TIMELINE', 'BADGE', 'EMBLEM'];

            for (const prefix of prefixes) {
                const id = generateUniqueId(prefix);
                expect(id.startsWith(`${prefix}-`)).toBe(true);
            }
        });

        it('devrait accepter un préfixe vide', () => {
            const id = generateUniqueId('');
            expect(id.startsWith('-')).toBe(true);
        });

        it('devrait être suffisamment court pour une URL', () => {
            const id = generateUniqueId('ANNOUNCEMENT');
            // Maximum raisonnable pour une URL
            expect(id.length).toBeLessThan(40);
        });
    });

    // ============================================
    // Cas limites
    // ============================================
    describe('Cas limites', () => {

        it('devrait gérer un préfixe très long', () => {
            const longPrefix = 'A'.repeat(50);
            const id = generateUniqueId(longPrefix);
            expect(id.startsWith(longPrefix)).toBe(true);
        });

        it('devrait être thread-safe (pas de collisions avec appels rapides)', () => {
            const ids = [];
            for (let i = 0; i < 1000; i++) {
                ids.push(generateUniqueId('RAPID'));
            }

            const uniqueIds = new Set(ids);
            expect(uniqueIds.size).toBe(1000);
        });

        it('devrait contenir uniquement des caractères URL-safe', () => {
            const id = generateUniqueId('SAFE');
            // Vérifie qu'il n'y a que des lettres, chiffres et tirets
            expect(id).toMatch(/^[A-Za-z0-9-]+$/);
        });
    });

    // ============================================
    // Format et structure
    // ============================================
    describe('Format et structure', () => {

        it('devrait avoir exactement 3 parties séparées par des tirets', () => {
            const id = generateUniqueId('PARTS');
            const parts = id.split('-');
            expect(parts).toHaveLength(3);
        });

        it('devrait avoir le format PREFIX-DATE-RANDOM', () => {
            const id = generateUniqueId('FORMAT');
            const parts = id.split('-');

            expect(parts[0]).toBe('FORMAT');
            expect(parts[1]).toMatch(/^\d{8}$/);
            expect(parts[2]).toMatch(/^[a-f0-9]{6}$/);
        });
    });
});
