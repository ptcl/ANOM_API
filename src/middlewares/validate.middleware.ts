import { Request, Response, NextFunction } from 'express';
import { z, ZodSchema } from 'zod';
import logger from '../utils/logger';

interface ValidationOptions {
    source?: 'body' | 'query' | 'params';
}

export function validate<T extends ZodSchema>(schema: T, options: ValidationOptions = {}) {
    const { source = 'body' } = options;

    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const dataToValidate = req[source];
            const result = await schema.safeParseAsync(dataToValidate);

            if (!result.success) {
                const errors = result.error.issues.map((err: any) => ({
                    field: err.path.join('.') || 'root',
                    message: err.message,
                    code: err.code
                }));

                logger.debug('Validation failed', {
                    source,
                    errors,
                    ip: req.ip
                });

                res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: errors.map(e => `${e.field}: ${e.message}`)
                });
                return;
            }

            if (source === 'body') {
                req.body = result.data;
            }

            (req as any).validated = (req as any).validated || {};
            (req as any).validated[source] = result.data;

            next();
        } catch (error: any) {
            logger.error('Validation middleware error', { error: error.message });
            res.status(500).json({
                success: false,
                error: 'Internal server error'
            });
        }
    };
}

export function validateMultiple(schemas: { body?: ZodSchema; query?: ZodSchema; params?: ZodSchema; }) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const allErrors: { source: string; field: string; message: string }[] = [];

        for (const [source, schema] of Object.entries(schemas)) {
            if (!schema) continue;

            const result = await schema.safeParseAsync((req as any)[source]);

            if (!result.success) {
                result.error.issues.forEach((err: any) => {
                    allErrors.push({
                        source,
                        field: err.path.join('.') || source,
                        message: err.message
                    });
                });
            } else {
                (req as any)[source] = result.data;
            }
        }

        if (allErrors.length > 0) {
            logger.debug('Multi-validation failed', { errors: allErrors, ip: req.ip });

            res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: allErrors.map(e => `${e.source}.${e.field}: ${e.message}`)
            });
            return;
        }

        next();
    };
}

export default validate;
