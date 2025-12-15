/**
 * Tests unitaires pour les fonctions de formatage de dates
 * @file dateformat.test.ts
 */

import {
    formatTimestamp,
    formatForLog,
    formatForApi,
    formatForUser,
    formatRelativeTime
} from '../../utils/dateformat';

describe('Date Format Utils', () => {

    // Date fixe pour les tests reproductibles
    const fixedDate = new Date('2024-03-15T14:30:45.123Z');

    // ============================================
    // formatTimestamp - Format ISO
    // ============================================
    describe('formatTimestamp - ISO', () => {

        it('devrait formater en ISO 8601', () => {
            const result = formatTimestamp(fixedDate, { format: 'iso' });
            expect(result).toBe('2024-03-15T14:30:45.123Z');
        });

        it('devrait utiliser la date actuelle si non fournie', () => {
            const result = formatTimestamp(undefined, { format: 'iso' });
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
        });

        it('devrait gérer une date en string', () => {
            const result = formatTimestamp('2024-01-01T00:00:00.000Z', { format: 'iso' });
            expect(result).toBe('2024-01-01T00:00:00.000Z');
        });

        it('devrait gérer un timestamp numérique', () => {
            const timestamp = fixedDate.getTime();
            const result = formatTimestamp(timestamp, { format: 'iso' });
            expect(result).toBe('2024-03-15T14:30:45.123Z');
        });
    });

    // ============================================
    // formatTimestamp - Format Log
    // ============================================
    describe('formatTimestamp - Log', () => {

        it('devrait formater avec brackets pour les logs', () => {
            const result = formatTimestamp(fixedDate, { format: 'log' });
            // Le format dépend du timezone local, on vérifie juste la structure
            expect(result).toMatch(/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/);
            expect(result.startsWith('[')).toBe(true);
            expect(result.endsWith(']')).toBe(true);
        });

        it('devrait inclure les millisecondes si demandé', () => {
            const result = formatTimestamp(fixedDate, { format: 'log', includeMilliseconds: true });
            expect(result).toMatch(/\.\d{3}\]$/);
        });
    });

    // ============================================
    // formatForLog
    // ============================================
    describe('formatForLog', () => {

        it('devrait retourner un format log avec millisecondes', () => {
            const result = formatForLog(fixedDate);
            expect(result).toMatch(/^\[\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}\.\d{3}\]$/);
        });

        it('devrait fonctionner sans argument', () => {
            const result = formatForLog();
            expect(result).toMatch(/^\[.*\]$/);
        });
    });

    // ============================================
    // formatForApi
    // ============================================
    describe('formatForApi', () => {

        it('devrait retourner un format avec timezone offset', () => {
            const result = formatForApi(fixedDate);
            // Format: YYYY-MM-DDTHH:mm:ss+HH:MM ou -HH:MM
            expect(result).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}[+-]\d{2}:\d{2}$/);
        });

        it('devrait inclure le signe + ou -', () => {
            const result = formatForApi(fixedDate);
            expect(result).toMatch(/[+-]\d{2}:\d{2}$/);
        });
    });

    // ============================================
    // formatForUser
    // ============================================
    describe('formatForUser', () => {

        it('devrait retourner un format lisible par l\'utilisateur', () => {
            const result = formatForUser(fixedDate);
            // Le résultat dépend de la locale, on vérifie qu'il contient du texte
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(10);
        });

        it('devrait contenir l\'année', () => {
            const result = formatForUser(fixedDate);
            expect(result).toContain('2024');
        });
    });

    // ============================================
    // formatRelativeTime
    // ============================================
    describe('formatRelativeTime', () => {

        it('devrait afficher "à l\'instant" pour maintenant', () => {
            const now = new Date();
            const result = formatRelativeTime(now);
            expect(result).toMatch(/(à l'instant|il y a \d+ seconde)/);
        });

        it('devrait afficher en secondes pour moins d\'une minute', () => {
            const date = new Date(Date.now() - 30000); // 30 secondes avant
            const result = formatRelativeTime(date);
            expect(result).toMatch(/il y a \d+ seconde/);
        });

        it('devrait afficher en minutes pour moins d\'une heure', () => {
            const date = new Date(Date.now() - 5 * 60 * 1000); // 5 minutes avant
            const result = formatRelativeTime(date);
            expect(result).toMatch(/il y a \d+ minute/);
        });

        it('devrait afficher en heures pour moins d\'un jour', () => {
            const date = new Date(Date.now() - 3 * 60 * 60 * 1000); // 3 heures avant
            const result = formatRelativeTime(date);
            expect(result).toMatch(/il y a \d+ heure/);
        });

        it('devrait afficher en jours pour moins d\'une semaine', () => {
            const date = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000); // 2 jours avant
            const result = formatRelativeTime(date);
            expect(result).toMatch(/il y a \d+ jour/);
        });
    });

    // ============================================
    // Gestion des erreurs
    // ============================================
    describe('Gestion des erreurs', () => {

        it('devrait gérer une date invalide gracieusement', () => {
            const result = formatTimestamp('invalid-date');
            // Devrait retourner un format ISO valide (date actuelle)
            expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T/);
        });

        it('devrait accepter un objet Date', () => {
            const result = formatTimestamp(new Date());
            expect(typeof result).toBe('string');
        });
    });

    // ============================================
    // Formats spécifiques
    // ============================================
    describe('Formats spécifiques', () => {

        it('devrait supporter le format short', () => {
            const result = formatTimestamp(fixedDate, { format: 'short' });
            expect(typeof result).toBe('string');
            expect(result.length).toBeLessThan(25);
        });

        it('devrait supporter le format long', () => {
            const result = formatTimestamp(fixedDate, { format: 'long' });
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(20);
        });

        it('devrait supporter le format readable', () => {
            const result = formatTimestamp(fixedDate, { format: 'readable' });
            expect(typeof result).toBe('string');
            expect(result).toContain('2024');
        });
    });
});
