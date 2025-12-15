/**
 * Tests unitaires pour les fonctions de validation de code
 * @file codevalidation.test.ts
 */

import {
    validateTargetCode,
    splitTargetCodeToFinalCode,
    buildTargetCodeFromFinalCode,
    validateCodeFormat,
    validateAccessCode,
    codeMatchesFormat,
    determineFinalCode,
    getPartialCode,
    getFragmentData,
    isSectionComplete,
    calculateCompletionPercentage,
    IFinalCode
} from '../../utils/codevalidation';

describe('Code Validation Utils', () => {

    // ============================================
    // validateTargetCode
    // ============================================
    describe('validateTargetCode', () => {

        it('devrait valider un code au format AAA-BBB-CCC', () => {
            const result = validateTargetCode('ABC-123-XYZ');
            expect(result.isValid).toBe(true);
            expect(result.message).toBeUndefined();
        });

        it('devrait valider un code au format AAA-BBB-CCC-DDD', () => {
            const result = validateTargetCode('ABC-123-XYZ-789');
            expect(result.isValid).toBe(true);
        });

        it('devrait rejeter un code vide', () => {
            const result = validateTargetCode('');
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('vide');
        });

        it('devrait rejeter null', () => {
            const result = validateTargetCode(null as any);
            expect(result.isValid).toBe(false);
        });

        it('devrait rejeter un code avec mauvais format', () => {
            const result = validateTargetCode('ABCD-123-XYZ');
            expect(result.isValid).toBe(false);
            expect(result.message).toContain('format');
        });

        it('devrait rejeter un code en minuscules', () => {
            const result = validateTargetCode('abc-123-xyz');
            expect(result.isValid).toBe(false);
        });

        it('devrait rejeter un code sans tirets', () => {
            const result = validateTargetCode('ABC123XYZ');
            expect(result.isValid).toBe(false);
        });

        it('devrait rejeter un code avec caractères spéciaux', () => {
            const result = validateTargetCode('AB!-123-XYZ');
            expect(result.isValid).toBe(false);
        });
    });

    // ============================================
    // splitTargetCodeToFinalCode
    // ============================================
    describe('splitTargetCodeToFinalCode', () => {

        it('devrait décomposer un code 3 segments correctement', () => {
            const result = splitTargetCodeToFinalCode('ABC-DEF-GHI');

            expect(result.AAA).toEqual({ A1: 'A', A2: 'B', A3: 'C' });
            expect(result.BBB).toEqual({ B1: 'D', B2: 'E', B3: 'F' });
            expect(result.CCC).toEqual({ C1: 'G', C2: 'H', C3: 'I' });
            expect(result.DDD).toBeUndefined();
        });

        it('devrait décomposer un code 4 segments correctement', () => {
            const result = splitTargetCodeToFinalCode('ABC-DEF-GHI-JKL');

            expect(result.AAA).toEqual({ A1: 'A', A2: 'B', A3: 'C' });
            expect(result.DDD).toEqual({ D1: 'J', D2: 'K', D3: 'L' });
        });

        it('devrait lever une erreur pour un code invalide', () => {
            expect(() => splitTargetCodeToFinalCode('INVALID'))
                .toThrow('Code invalide');
        });

        it('devrait gérer les codes numériques', () => {
            const result = splitTargetCodeToFinalCode('123-456-789');
            expect(result.AAA).toEqual({ A1: '1', A2: '2', A3: '3' });
        });
    });

    // ============================================
    // buildTargetCodeFromFinalCode
    // ============================================
    describe('buildTargetCodeFromFinalCode', () => {

        it('devrait reconstruire un code 3 segments', () => {
            const finalCode: IFinalCode = {
                AAA: { A1: 'A', A2: 'B', A3: 'C' },
                BBB: { B1: 'D', B2: 'E', B3: 'F' },
                CCC: { C1: 'G', C2: 'H', C3: 'I' }
            };

            const result = buildTargetCodeFromFinalCode(finalCode);
            expect(result).toBe('ABC-DEF-GHI');
        });

        it('devrait reconstruire un code 4 segments', () => {
            const finalCode: IFinalCode = {
                AAA: { A1: 'A', A2: 'B', A3: 'C' },
                BBB: { B1: 'D', B2: 'E', B3: 'F' },
                CCC: { C1: 'G', C2: 'H', C3: 'I' },
                DDD: { D1: 'J', D2: 'K', D3: 'L' }
            };

            const result = buildTargetCodeFromFinalCode(finalCode);
            expect(result).toBe('ABC-DEF-GHI-JKL');
        });

        it('devrait être l\'inverse de splitTargetCodeToFinalCode', () => {
            const originalCode = 'XY7-9AB-CD3';
            const split = splitTargetCodeToFinalCode(originalCode);
            const rebuilt = buildTargetCodeFromFinalCode(split);

            expect(rebuilt).toBe(originalCode);
        });
    });

    // ============================================
    // validateCodeFormat
    // ============================================
    describe('validateCodeFormat', () => {

        it('devrait valider le format XXX-XXX-XXX', () => {
            const result = validateCodeFormat('AAA-BBB-CCC');
            expect(result.isValid).toBe(true);
        });

        it('devrait valider le format XXX-XXX-XXX-XXX', () => {
            const result = validateCodeFormat('AAA-BBB-CCC-DDD');
            expect(result.isValid).toBe(true);
        });

        it('devrait rejeter un format vide', () => {
            const result = validateCodeFormat('');
            expect(result.isValid).toBe(false);
        });

        it('devrait rejeter un format avec chiffres', () => {
            const result = validateCodeFormat('AA1-BBB-CCC');
            expect(result.isValid).toBe(false);
        });
    });

    // ============================================
    // validateAccessCode
    // ============================================
    describe('validateAccessCode', () => {

        it('devrait valider un code d\'accès simple', () => {
            const result = validateAccessCode('ACCESS_CODE_123');
            expect(result.isValid).toBe(true);
        });

        it('devrait valider un code avec tirets', () => {
            const result = validateAccessCode('my-access-code');
            expect(result.isValid).toBe(true);
        });

        it('devrait rejeter un code trop court', () => {
            const result = validateAccessCode('ab');
            expect(result.isValid).toBe(false);
        });

        it('devrait rejeter un code trop long', () => {
            const longCode = 'a'.repeat(51);
            const result = validateAccessCode(longCode);
            expect(result.isValid).toBe(false);
        });

        it('devrait rejeter un code avec espaces', () => {
            const result = validateAccessCode('access code');
            expect(result.isValid).toBe(false);
        });
    });

    // ============================================
    // codeMatchesFormat
    // ============================================
    describe('codeMatchesFormat', () => {

        it('devrait retourner true si le code correspond au format', () => {
            expect(codeMatchesFormat('ABC-DEF-GHI', 'XXX-XXX-XXX')).toBe(true);
        });

        it('devrait retourner false si longueurs différentes', () => {
            expect(codeMatchesFormat('ABC-DEF', 'XXX-XXX-XXX')).toBe(false);
        });

        it('devrait retourner false pour code vide', () => {
            expect(codeMatchesFormat('', 'XXX-XXX-XXX')).toBe(false);
        });

        it('devrait retourner false pour format vide', () => {
            expect(codeMatchesFormat('ABC-DEF-GHI', '')).toBe(false);
        });
    });

    // ============================================
    // determineFinalCode
    // ============================================
    describe('determineFinalCode', () => {

        it('devrait retourner autoGenerated si fourni', () => {
            const auto = { AAA: { A1: 'X', A2: 'Y', A3: 'Z' }, BBB: { B1: 'A', B2: 'B', B3: 'C' }, CCC: { C1: '1', C2: '2', C3: '3' } };
            const result = determineFinalCode(auto, null);
            expect(result).toBe(auto);
        });

        it('devrait retourner provided si autoGenerated est null', () => {
            const provided = { AAA: { A1: 'P', A2: 'Q', A3: 'R' }, BBB: { B1: 'S', B2: 'T', B3: 'U' }, CCC: { C1: 'V', C2: 'W', C3: 'X' } };
            const result = determineFinalCode(null, provided);
            expect(result).toBe(provided);
        });

        it('devrait retourner un code vide si rien n\'est fourni', () => {
            const result = determineFinalCode(null, null);
            expect(result.AAA).toEqual({ A1: '', A2: '', A3: '' });
            expect(result.BBB).toEqual({ B1: '', B2: '', B3: '' });
            expect(result.CCC).toEqual({ C1: '', C2: '', C3: '' });
        });
    });

    // ============================================
    // getPartialCode
    // ============================================
    describe('getPartialCode', () => {

        const testFinalCode = {
            AAA: { A1: 'A', A2: 'B', A3: 'C' },
            BBB: { B1: 'D', B2: 'E', B3: 'F' },
            CCC: { C1: 'G', C2: 'H', C3: 'I' },
            DDD: { D1: 'J', D2: 'K', D3: 'L' }
        };

        it('devrait afficher X pour les fragments non débloqués', () => {
            const result = getPartialCode([], testFinalCode);
            expect(result).toBe('XXX-XXX-XXX');
        });

        it('devrait afficher les fragments débloqués', () => {
            const result = getPartialCode(['A1', 'B2', 'C3'], testFinalCode);
            expect(result).toBe('AXX-XEX-XXI');
        });

        it('devrait afficher le code complet si tout est débloqué', () => {
            const allFragments = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
            const result = getPartialCode(allFragments, testFinalCode);
            expect(result).toBe('ABC-DEF-GHI');
        });

        it('devrait supporter le format 4 segments', () => {
            const result = getPartialCode(['D1'], testFinalCode, 'AAA-BBB-CCC-DDD');
            expect(result).toBe('XXX-XXX-XXX-JXX');
        });
    });

    // ============================================
    // getFragmentData
    // ============================================
    describe('getFragmentData', () => {

        const testFinalCode = {
            AAA: { A1: 'A', A2: 'B', A3: 'C' },
            BBB: { B1: 'D', B2: 'E', B3: 'F' },
            CCC: { C1: 'G', C2: 'H', C3: 'I' }
        };

        it('devrait retourner la valeur du fragment A1', () => {
            expect(getFragmentData('A1', testFinalCode)).toBe('A');
        });

        it('devrait retourner la valeur du fragment B2', () => {
            expect(getFragmentData('B2', testFinalCode)).toBe('E');
        });

        it('devrait retourner null pour un fragment inexistant', () => {
            expect(getFragmentData('Z1', testFinalCode)).toBeNull();
        });
    });

    // ============================================
    // isSectionComplete
    // ============================================
    describe('isSectionComplete', () => {

        it('devrait retourner true si tous les fragments AAA sont débloqués', () => {
            expect(isSectionComplete('AAA', ['A1', 'A2', 'A3'])).toBe(true);
        });

        it('devrait retourner false si un fragment manque', () => {
            expect(isSectionComplete('AAA', ['A1', 'A2'])).toBe(false);
        });

        it('devrait fonctionner pour la section BBB', () => {
            expect(isSectionComplete('BBB', ['B1', 'B2', 'B3'])).toBe(true);
        });

        it('devrait fonctionner pour la section DDD', () => {
            expect(isSectionComplete('DDD', ['D1', 'D2', 'D3', 'A1'])).toBe(true);
        });
    });

    // ============================================
    // calculateCompletionPercentage
    // ============================================
    describe('calculateCompletionPercentage', () => {

        it('devrait retourner 0% pour aucun fragment', () => {
            expect(calculateCompletionPercentage([])).toBe(0);
        });

        it('devrait retourner 100% pour 9 fragments (format 3 segments)', () => {
            const allFragments = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3'];
            expect(calculateCompletionPercentage(allFragments)).toBe(100);
        });

        it('devrait retourner ~33% pour 3 fragments sur 9', () => {
            expect(calculateCompletionPercentage(['A1', 'A2', 'A3'])).toBe(33);
        });

        it('devrait calculer correctement pour le format 4 segments', () => {
            const allFragments = ['A1', 'A2', 'A3', 'B1', 'B2', 'B3', 'C1', 'C2', 'C3', 'D1', 'D2', 'D3'];
            expect(calculateCompletionPercentage(allFragments, 'AAA-BBB-CCC-DDD')).toBe(100);
        });

        it('devrait retourner 25% pour 3 fragments sur 12 (format 4 segments)', () => {
            expect(calculateCompletionPercentage(['A1', 'A2', 'A3'], 'AAA-BBB-CCC-DDD')).toBe(25);
        });
    });
});
