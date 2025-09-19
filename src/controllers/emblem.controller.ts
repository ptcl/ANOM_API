import { Request, Response } from 'express';
import { generateUniqueId } from '../utils/generate';
import { EmblemModel } from '../models/emblem.model';
import { IEmblem } from '../types/emblem';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { formatForUser } from '../utils';

const codePattern = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}$/;


export const createEmblem = async (req: Request, res: Response) => {
    try {
        // Validation des données d'entrée
        const { name, description, image, code, status } = req.body;

        // Validation du nom (obligatoire)
        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Le nom de l\'emblème est obligatoire',
                error: 'validation_error'
            });
        }

        if (name.length > 100) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Le nom ne peut pas dépasser 100 caractères',
                error: 'validation_error'
            });
        }

        // Validation de la description (optionnelle)
        if (description && (typeof description !== 'string' || description.length > 500)) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'La description ne peut pas dépasser 500 caractères',
                error: 'validation_error'
            });
        }

        // Validation de l'URL d'image (optionnelle)
        if (image && typeof image !== 'string') {
            return ApiResponseBuilder.error(res, 400, {
                message: 'L\'URL de l\'image doit être une chaîne de caractères',
                error: 'validation_error'
            });
        }

        // Validation du code (optionnel mais format strict)
        if (code) {
            if (typeof code !== 'string' || !codePattern.test(code)) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'Le code doit être au format XXX-XXX-XXX (lettres ou chiffres majuscules)',
                    error: 'validation_error'
                });
            }
        }

        // Validation du statut
        const allowedStatuses: Array<IEmblem['status']> = ['available', 'unavailable'];
        if (!status || !allowedStatuses.includes(status)) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Le statut doit être "available" ou "unavailable"',
                error: 'validation_error'
            });
        }

        // Vérification de l'unicité du code
        if (code) {
            const existingEmblem = await EmblemModel.findOne({ code });
            if (existingEmblem) {
                return ApiResponseBuilder.error(res, 409, {
                    message: 'Un emblème avec ce code existe déjà',
                    error: 'duplicate_code'
                });
            }
        }

        // Préparation des données sécurisées
        const emblemData: Partial<IEmblem> = {
            emblemId: generateUniqueId('EMBLEM'),
            name: name.trim(),
            description: description?.trim() || undefined,
            image: image || undefined,
            code: code || undefined, // Ne pas modifier le code
            status
        };

        const newEmblem = await EmblemModel.create(emblemData);

        return res.status(201).json({
            success: true,
            message: 'Emblème créé avec succès',
            data: newEmblem
        });

    } catch (error: any) {
        console.error('Erreur lors de la création de l\'emblème:', {
            error: error.message,
            stack: error.stack,
            timestamp: formatForUser()
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur interne du serveur',
            error: 'internal_server_error'
        });
    }
};

export const updateEmblem = async (req: Request, res: Response) => {
    try {
        const { emblemId } = req.params;
        const { name, description, image, code, status } = req.body;

        // Validation de l'emblemId
        if (!emblemId || typeof emblemId !== 'string') {
            return ApiResponseBuilder.error(res, 400, {
                message: 'ID d\'emblème invalide',
                error: 'validation_error'
            });
        }

        // Vérification que l'emblème existe
        const existingEmblem = await EmblemModel.findOne({ emblemId });
        if (!existingEmblem) {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Emblème non trouvé',
                error: 'not_found'
            });
        }

        // Préparation des données de mise à jour
        const updateData: Partial<IEmblem> = {};

        // Validation du nom (si fourni)
        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length === 0) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'Le nom de l\'emblème ne peut pas être vide',
                    error: 'validation_error'
                });
            }
            if (name.length > 100) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'Le nom ne peut pas dépasser 100 caractères',
                    error: 'validation_error'
                });
            }
            updateData.name = name.trim();
        }

        // Validation de la description (si fournie)
        if (description !== undefined) {
            if (description && (typeof description !== 'string' || description.length > 500)) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'La description ne peut pas dépasser 500 caractères',
                    error: 'validation_error'
                });
            }
            updateData.description = description?.trim() || undefined;
        }

        // Validation de l'URL d'image (si fournie)
        if (image !== undefined) {
            if (image && typeof image !== 'string') {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'L\'URL de l\'image doit être une chaîne de caractères',
                    error: 'validation_error'
                });
            }
            updateData.image = image || undefined;
        }

        // Validation du code (si fourni) - CRITIQUE: ne pas modifier
        if (code !== undefined) {
            if (code && (typeof code !== 'string' || !codePattern.test(code))) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'Le code doit être au format XXX-XXX-XXX (lettres ou chiffres majuscules)',
                    error: 'validation_error'
                });
            }

            // Vérification de l'unicité du code (si différent de l'actuel)
            if (code && code !== existingEmblem.code) {
                const duplicateEmblem = await EmblemModel.findOne({
                    code,
                    emblemId: { $ne: emblemId }
                });
                if (duplicateEmblem) {
                    return ApiResponseBuilder.error(res, 409, {
                        message: 'Un emblème avec ce code existe déjà',
                        error: 'duplicate_code'
                    });
                }
            }

            updateData.code = code; // Pas de trim sur le code
        }

        // Validation du statut (si fourni)
        if (status !== undefined) {
            const allowedStatuses: Array<IEmblem['status']> = ['available', 'unavailable'];
            if (!allowedStatuses.includes(status)) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'Le statut doit être "available" ou "unavailable"',
                    error: 'validation_error'
                });
            }
            updateData.status = status;
        }

        // Mise à jour sécurisée
        const updatedEmblem = await EmblemModel.findOneAndUpdate(
            { emblemId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Emblème mis à jour avec succès',
            data: updatedEmblem
        });

    } catch (error: any) {
        console.error('Erreur lors de la mise à jour de l\'emblème:', {
            emblemId: req.params.emblemId,
            error: error.message,
            stack: error.stack,
            timestamp: formatForUser()
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur interne du serveur',
            error: 'internal_server_error'
        });
    }
};

export const deleteEmblem = async (req: Request, res: Response) => {
    try {
        const { emblemId } = req.params;

        // Validation de l'emblemId
        if (!emblemId || typeof emblemId !== 'string') {
            return ApiResponseBuilder.error(res, 400, {
                message: 'ID d\'emblème invalide',
                error: 'validation_error'
            });
        }

        // Vérification de l'existence avant suppression
        const existingEmblem = await EmblemModel.findOne({ emblemId });
        if (!existingEmblem) {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Emblème non trouvé',
                error: 'not_found'
            });
        }

        // Log de sécurité pour la suppression
        console.log('Suppression d\'emblème:', {
            emblemId,
            emblemName: existingEmblem.name,
            deletedBy: (req as any).user?.agentId || 'unknown',
            timestamp: formatForUser()
        });

        // Suppression sécurisée
        await EmblemModel.findOneAndDelete({ emblemId });

        return res.status(200).json({
            success: true,
            message: 'Emblème supprimé avec succès'
        });

    } catch (error: any) {
        console.error('Erreur lors de la suppression de l\'emblème:', {
            emblemId: req.params.emblemId,
            error: error.message,
            stack: error.stack,
            timestamp: formatForUser()
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur interne du serveur',
            error: 'internal_server_error'
        });
    }
};

export const getAllEmblems = async (req: Request, res: Response) => {
    try {
        // Support de pagination et filtrage
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 100); // Max 100 par page
        const status = req.query.status as IEmblem['status'];

        // Construction du filtre
        const filter: any = {};
        if (status && ['available', 'unavailable'].includes(status)) {
            filter.status = status;
        }

        // Calcul de la pagination
        const skip = (page - 1) * limit;

        // Récupération sécurisée avec pagination
        const [emblems, total] = await Promise.all([
            EmblemModel.find(filter)
                .select('emblemId name description image code status createdAt updatedAt')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            EmblemModel.countDocuments(filter)
        ]);

        // Métadonnées de pagination
        const pagination = {
            page,
            limit,
            total,
            pages: Math.ceil(total / limit),
            hasNext: page < Math.ceil(total / limit),
            hasPrev: page > 1
        };

        return res.status(200).json({
            success: true,
            message: 'Emblèmes récupérés avec succès',
            data: emblems,
            pagination
        });

    } catch (error: any) {
        console.error('Erreur lors de la récupération des emblèmes:', {
            error: error.message,
            stack: error.stack,
            timestamp: formatForUser()
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur interne du serveur',
            error: 'internal_server_error'
        });
    }
};

export const getEmblemById = async (req: Request, res: Response) => {
    try {
        const { emblemId } = req.params;

        // Validation de l'emblemId
        if (!emblemId || typeof emblemId !== 'string') {
            return ApiResponseBuilder.error(res, 400, {
                message: 'ID d\'emblème invalide',
                error: 'validation_error'
            });
        }

        // Récupération sécurisée avec projection
        const emblem = await EmblemModel.findOne({ emblemId })
            .select('emblemId name description image code status createdAt updatedAt')
            .lean();

        if (!emblem) {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Emblème non trouvé',
                error: 'not_found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Emblème récupéré avec succès',
            data: emblem
        });

    } catch (error: any) {
        console.error('Erreur lors de la récupération de l\'emblème:', {
            emblemId: req.params.emblemId,
            error: error.message,
            stack: error.stack,
            timestamp: formatForUser()
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Erreur interne du serveur',
            error: 'internal_server_error'
        });
    }
};
