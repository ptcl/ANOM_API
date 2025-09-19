import { Response } from 'express';
import { formatForUser } from './dateformat';

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
    details?: any;
    timestamp: string;
    code?: string;
}

export interface ApiResponseOptions<T = any> {
    success?: boolean;
    message?: string;
    data?: T;
    error?: string;
    details?: any;
    code?: string;
    timestamp?: string;
}

export class ApiResponseBuilder {

    static success<T = any>(res: Response, options: ApiResponseOptions<T> = {}): Response {
        const response: ApiResponse<T> = {
            success: true,
            message: options.message || 'Opération réussie',
            timestamp: options.timestamp || new Date().toISOString()
        };

        if (options.data !== undefined) {
            response.data = options.data;
        }

        if (options.code) {
            response.code = options.code;
        }

        return res.status(200).json(response);
    }
    static error(
        res: Response, 
        statusCode: number = 500, 
        options: ApiResponseOptions = {}
    ): Response {
        const response: ApiResponse = {
            success: false,
            message: options.message || 'Une erreur est survenue',
            error: options.error || 'unknown_error',
            timestamp: options.timestamp || formatForUser()
        };

        if (options.details) {
            response.details = options.details;
        }

        if (options.code) {
            response.code = options.code;
        }

        return res.status(statusCode).json(response);
    }

    static notFound(
        res: Response, 
        options: ApiResponseOptions = {}
    ): Response {
        return this.error(res, 404, {
            message: options.message || 'Ressource non trouvée',
            error: options.error || 'not_found',
            details: options.details,
            code: options.code
        });
    }

    static badRequest(
        res: Response, 
        options: ApiResponseOptions = {}
    ): Response {
        return this.error(res, 400, {
            message: options.message || 'Requête invalide',
            error: options.error || 'bad_request',
            details: options.details,
            code: options.code
        });
    }

    static unauthorized(
        res: Response, 
        options: ApiResponseOptions = {}
    ): Response {
        return this.error(res, 401, {
            message: options.message || 'Non autorisé',
            error: options.error || 'unauthorized',
            details: options.details,
            code: options.code
        });
    }

    static forbidden(
        res: Response, 
        options: ApiResponseOptions = {}
    ): Response {
        return this.error(res, 403, {
            message: options.message || 'Accès interdit',
            error: options.error || 'forbidden',
            details: options.details,
            code: options.code
        });
    }
}
