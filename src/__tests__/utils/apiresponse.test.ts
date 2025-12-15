/**
 * Tests unitaires pour ApiResponseBuilder
 * @file apiresponse.test.ts
 */

import { ApiResponseBuilder } from '../../utils/apiresponse';
import { Response } from 'express';

// Mock d'un objet Response Express
const createMockResponse = (): Partial<Response> & {
    statusCode: number;
    jsonData: any;
    status: jest.Mock;
    json: jest.Mock;
} => {
    const res: any = {
        statusCode: 200,
        jsonData: null,
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

describe('ApiResponseBuilder', () => {

    let mockRes: ReturnType<typeof createMockResponse>;

    beforeEach(() => {
        mockRes = createMockResponse();
    });

    // ============================================
    // success
    // ============================================
    describe('success', () => {

        it('devrait retourner un status 200', () => {
            ApiResponseBuilder.success(mockRes as Response);
            expect(mockRes.statusCode).toBe(200);
        });

        it('devrait avoir success: true', () => {
            ApiResponseBuilder.success(mockRes as Response);
            expect(mockRes.jsonData.success).toBe(true);
        });

        it('devrait avoir un message par défaut', () => {
            ApiResponseBuilder.success(mockRes as Response);
            expect(mockRes.jsonData.message).toBe('Opération réussie');
        });

        it('devrait accepter un message personnalisé', () => {
            ApiResponseBuilder.success(mockRes as Response, {
                message: 'Agent créé avec succès'
            });
            expect(mockRes.jsonData.message).toBe('Agent créé avec succès');
        });

        it('devrait inclure les données si fournies', () => {
            const testData = { id: '123', name: 'Test Agent' };
            ApiResponseBuilder.success(mockRes as Response, {
                data: testData
            });
            expect(mockRes.jsonData.data).toEqual(testData);
        });

        it('devrait ne pas inclure data si non fourni', () => {
            ApiResponseBuilder.success(mockRes as Response);
            expect(mockRes.jsonData.data).toBeUndefined();
        });

        it('devrait inclure un timestamp', () => {
            ApiResponseBuilder.success(mockRes as Response);
            expect(mockRes.jsonData.timestamp).toBeDefined();
        });

        it('devrait inclure un code si fourni', () => {
            ApiResponseBuilder.success(mockRes as Response, {
                code: 'AGENT_CREATED'
            });
            expect(mockRes.jsonData.code).toBe('AGENT_CREATED');
        });
    });

    // ============================================
    // error
    // ============================================
    describe('error', () => {

        it('devrait retourner le status code spécifié', () => {
            ApiResponseBuilder.error(mockRes as Response, 400);
            expect(mockRes.statusCode).toBe(400);
        });

        it('devrait avoir un status 500 par défaut', () => {
            ApiResponseBuilder.error(mockRes as Response);
            expect(mockRes.statusCode).toBe(500);
        });

        it('devrait avoir success: false', () => {
            ApiResponseBuilder.error(mockRes as Response, 400);
            expect(mockRes.jsonData.success).toBe(false);
        });

        it('devrait avoir un message d\'erreur par défaut', () => {
            ApiResponseBuilder.error(mockRes as Response, 500);
            expect(mockRes.jsonData.message).toBe('Une erreur est survenue');
        });

        it('devrait accepter un message personnalisé', () => {
            ApiResponseBuilder.error(mockRes as Response, 400, {
                message: 'Données invalides'
            });
            expect(mockRes.jsonData.message).toBe('Données invalides');
        });

        it('devrait avoir un type d\'erreur par défaut', () => {
            ApiResponseBuilder.error(mockRes as Response, 500);
            expect(mockRes.jsonData.error).toBe('unknown_error');
        });

        it('devrait accepter un type d\'erreur personnalisé', () => {
            ApiResponseBuilder.error(mockRes as Response, 400, {
                error: 'validation_error'
            });
            expect(mockRes.jsonData.error).toBe('validation_error');
        });

        it('devrait inclure les détails si fournis', () => {
            const details = { field: 'email', reason: 'invalid' };
            ApiResponseBuilder.error(mockRes as Response, 400, {
                details
            });
            expect(mockRes.jsonData.details).toEqual(details);
        });
    });

    // ============================================
    // notFound
    // ============================================
    describe('notFound', () => {

        it('devrait retourner un status 404', () => {
            ApiResponseBuilder.notFound(mockRes as Response);
            expect(mockRes.statusCode).toBe(404);
        });

        it('devrait avoir le message par défaut', () => {
            ApiResponseBuilder.notFound(mockRes as Response);
            expect(mockRes.jsonData.message).toBe('Ressource non trouvée');
        });

        it('devrait avoir l\'erreur "not_found"', () => {
            ApiResponseBuilder.notFound(mockRes as Response);
            expect(mockRes.jsonData.error).toBe('not_found');
        });

        it('devrait accepter un message personnalisé', () => {
            ApiResponseBuilder.notFound(mockRes as Response, {
                message: 'Agent non trouvé'
            });
            expect(mockRes.jsonData.message).toBe('Agent non trouvé');
        });
    });

    // ============================================
    // badRequest
    // ============================================
    describe('badRequest', () => {

        it('devrait retourner un status 400', () => {
            ApiResponseBuilder.badRequest(mockRes as Response);
            expect(mockRes.statusCode).toBe(400);
        });

        it('devrait avoir le message par défaut', () => {
            ApiResponseBuilder.badRequest(mockRes as Response);
            expect(mockRes.jsonData.message).toBe('Requête invalide');
        });

        it('devrait avoir l\'erreur "bad_request"', () => {
            ApiResponseBuilder.badRequest(mockRes as Response);
            expect(mockRes.jsonData.error).toBe('bad_request');
        });
    });

    // ============================================
    // unauthorized
    // ============================================
    describe('unauthorized', () => {

        it('devrait retourner un status 401', () => {
            ApiResponseBuilder.unauthorized(mockRes as Response);
            expect(mockRes.statusCode).toBe(401);
        });

        it('devrait avoir le message par défaut', () => {
            ApiResponseBuilder.unauthorized(mockRes as Response);
            expect(mockRes.jsonData.message).toBe('Non autorisé');
        });

        it('devrait avoir l\'erreur "unauthorized"', () => {
            ApiResponseBuilder.unauthorized(mockRes as Response);
            expect(mockRes.jsonData.error).toBe('unauthorized');
        });
    });

    // ============================================
    // forbidden
    // ============================================
    describe('forbidden', () => {

        it('devrait retourner un status 403', () => {
            ApiResponseBuilder.forbidden(mockRes as Response);
            expect(mockRes.statusCode).toBe(403);
        });

        it('devrait avoir le message par défaut', () => {
            ApiResponseBuilder.forbidden(mockRes as Response);
            expect(mockRes.jsonData.message).toBe('Accès interdit');
        });

        it('devrait avoir l\'erreur "forbidden"', () => {
            ApiResponseBuilder.forbidden(mockRes as Response);
            expect(mockRes.jsonData.error).toBe('forbidden');
        });
    });

    // ============================================
    // Structure de réponse cohérente
    // ============================================
    describe('Structure de réponse', () => {

        it('toutes les réponses devraient avoir success et message', () => {
            const methods = [
                () => ApiResponseBuilder.success(mockRes as Response),
                () => ApiResponseBuilder.error(mockRes as Response),
                () => ApiResponseBuilder.notFound(mockRes as Response),
                () => ApiResponseBuilder.badRequest(mockRes as Response),
                () => ApiResponseBuilder.unauthorized(mockRes as Response),
                () => ApiResponseBuilder.forbidden(mockRes as Response)
            ];

            for (const method of methods) {
                mockRes = createMockResponse();
                method();
                expect(mockRes.jsonData).toHaveProperty('success');
                expect(mockRes.jsonData).toHaveProperty('message');
                expect(mockRes.jsonData).toHaveProperty('timestamp');
            }
        });

        it('les erreurs devraient avoir un champ error', () => {
            const errorMethods = [
                () => ApiResponseBuilder.error(mockRes as Response),
                () => ApiResponseBuilder.notFound(mockRes as Response),
                () => ApiResponseBuilder.badRequest(mockRes as Response),
                () => ApiResponseBuilder.unauthorized(mockRes as Response),
                () => ApiResponseBuilder.forbidden(mockRes as Response)
            ];

            for (const method of errorMethods) {
                mockRes = createMockResponse();
                method();
                expect(mockRes.jsonData).toHaveProperty('error');
            }
        });
    });
});
