import { Request, Response } from 'express';
import { generateUniqueId } from '../utils/generate';
import { EmblemModel } from '../models/emblem.model';
import { IEmblem } from '../types/emblem';
import { ApiResponseBuilder } from '../utils/apiresponse';
import { logger } from '../utils';

const codePattern = /^[A-Z0-9]{3}-[A-Z0-9]{3}-[A-Z0-9]{3}$/;


export const createEmblem = async (req: Request, res: Response) => {
    try {
        const { name, description, image, code, rarity, status } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Emblem name is required.',
                error: 'validation_error'
            });
        }

        if (name.length > 100) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Name cannot exceed 100 characters.',
                error: 'validation_error'
            });
        }

        if (description && (typeof description !== 'string' || description.length > 500)) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Description cannot exceed 500 characters.',
                error: 'validation_error'
            });
        }

        if (image && typeof image !== 'string') {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Image URL must be a string.',
                error: 'validation_error'
            });
        }

        if (code) {
            if (typeof code !== 'string' || !codePattern.test(code)) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'Code must be in the format XXX-XXX-XXX (uppercase letters or digits)',
                    error: 'validation_error'
                });
            }
        }

        const allowedStatuses: Array<IEmblem['status']> = ['AVAILABLE', 'UNAVAILABLE'];
        if (!status || !allowedStatuses.includes(status)) {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Status must be "AVAILABLE" or "UNAVAILABLE"',
                error: 'validation_error'
            });
        }

        if (code) {
            const existingEmblem = await EmblemModel.findOne({ code });
            if (existingEmblem) {
                return ApiResponseBuilder.error(res, 409, {
                    message: 'An emblem with this code already exists',
                    error: 'duplicate_code'
                });
            }
        }

        const emblemData: Partial<IEmblem> = {
            emblemId: generateUniqueId('EMBLEM'),
            name: name.trim(),
            description: description?.trim() || undefined,
            image: image || undefined,
            code: code || undefined,
            rarity: rarity || 'COMMON',
            status
        };

        const newEmblem = await EmblemModel.create(emblemData);

        return res.status(201).json({
            success: true,
            message: 'Emblem created successfully',
            data: newEmblem
        });

    } catch (error: any) {
        logger.error('Error creating emblem:', {
            error: error.message,
            stack: error.stack,
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Internal server error',
            error: 'internal_server_error'
        });
    }
};

export const updateEmblem = async (req: Request, res: Response) => {
    try {
        const { emblemId } = req.params;
        const { name, description, image, code, rarity, status } = req.body;

        if (!emblemId || typeof emblemId !== 'string') {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Invalid emblem ID',
                error: 'validation_error'
            });
        }

        const existingEmblem = await EmblemModel.findOne({ emblemId });
        if (!existingEmblem) {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Emblem not found',
                error: 'not_found'
            });
        }

        const updateData: Partial<IEmblem> = {};

        if (name !== undefined) {
            if (typeof name !== 'string' || name.trim().length === 0) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'Emblem name cannot be empty',
                    error: 'validation_error'
                });
            }
            if (name.length > 100) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'Name cannot exceed 100 characters.',
                    error: 'validation_error'
                });
            }
            updateData.name = name.trim();
        }

        if (description !== undefined) {
            if (description && (typeof description !== 'string' || description.length > 500)) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'Description cannot exceed 500 characters.',
                    error: 'validation_error'
                });
            }
            updateData.description = description?.trim() || undefined;
        }

        if (image !== undefined) {
            if (image && typeof image !== 'string') {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'Image URL must be a string.',
                    error: 'validation_error'
                });
            }
            updateData.image = image || undefined;
        }

        if (code !== undefined) {
            if (code && (typeof code !== 'string' || !codePattern.test(code))) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'Code must be in the format XXX-XXX-XXX (uppercase letters or digits)',
                    error: 'validation_error'
                });
            }

            if (code && code !== existingEmblem.code) {
                const duplicateEmblem = await EmblemModel.findOne({
                    code,
                    emblemId: { $ne: emblemId }
                });
                if (duplicateEmblem) {
                    return ApiResponseBuilder.error(res, 409, {
                        message: 'An emblem with this code already exists',
                        error: 'duplicate_code'
                    });
                }
            }

            updateData.code = code;
        }

        if (rarity !== undefined) {
            const allowedRarities: Array<IEmblem['rarity']> = ['COMMON', 'RARE', 'LEGENDARY', 'EXOTIC'];
            if (!allowedRarities.includes(rarity)) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'Rarity must be "COMMON", "RARE", "LEGENDARY", or "EXOTIC"',
                    error: 'validation_error'
                });
            }
            updateData.rarity = rarity;
        }

        if (status !== undefined) {
            const allowedStatuses: Array<IEmblem['status']> = ['AVAILABLE', 'UNAVAILABLE'];
            if (!allowedStatuses.includes(status)) {
                return ApiResponseBuilder.error(res, 400, {
                    message: 'Status must be "AVAILABLE" or "UNAVAILABLE"',
                    error: 'validation_error'
                });
            }
            updateData.status = status;
        }

        const updatedEmblem = await EmblemModel.findOneAndUpdate(
            { emblemId },
            { $set: updateData },
            { new: true, runValidators: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Emblem updated successfully',
            data: updatedEmblem
        });

    } catch (error: any) {
        logger.error('Error updating emblem:', {
            emblemId: req.params.emblemId,
            error: error.message,
            stack: error.stack,
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Internal server error',
            error: 'internal_server_error'
        });
    }
};

export const deleteEmblem = async (req: Request, res: Response) => {
    try {
        const { emblemId } = req.params;

        if (!emblemId || typeof emblemId !== 'string') {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Invalid emblem ID',
                error: 'validation_error'
            });
        }

        const existingEmblem = await EmblemModel.findOne({ emblemId });
        if (!existingEmblem) {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Emblem not found',
                error: 'not_found'
            });
        }

        logger.info('Deleting emblemOMICS', {
            emblemId,
            emblemName: existingEmblem.name,
            deletedBy: (req as any).user?.agentId || 'unknown'
        });

        await EmblemModel.findOneAndDelete({ emblemId });

        return res.status(200).json({
            success: true,
            message: 'Emblem deleted successfully'
        });

    } catch (error: any) {
        logger.error('Error deleting emblem:', {
            emblemId: req.params.emblemId,
            error: error.message,
            stack: error.stack
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Internal server error',
            error: 'internal_server_error'
        });
    }
};

export const getAllEmblems = async (req: Request, res: Response) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
        const status = req.query.status as IEmblem['status'];

        const roles = req.user?.protocol?.roles || [];
        const isFounder = roles.some((role: any) => {
            const roleName = typeof role === 'string' ? role : role.roleName || role.name;
            return roleName?.toUpperCase() === 'FOUNDER';
        });

        const filter: any = {};
        if (status && ['AVAILABLE', 'UNAVAILABLE'].includes(status)) {
            filter.status = status;
        }

        if (!isFounder) {
            filter.status = 'AVAILABLE';
        }

        const skip = (page - 1) * limit;

        const selectFields = isFounder
            ? 'emblemId name description image code rarity status createdAt updatedAt'
            : 'emblemId name description image rarity status createdAt updatedAt';

        const [emblems, total] = await Promise.all([
            EmblemModel.find(filter)
                .select(selectFields)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            EmblemModel.countDocuments(filter)
        ]);

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
            message: 'Emblems retrieved successfully',
            data: emblems,
            pagination
        });

    } catch (error: any) {
        logger.error('Error retrieving emblems:', {
            error: error.message,
            stack: error.stack
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Internal server error',
            error: 'internal_server_error'
        });
    }
};

export const getEmblemById = async (req: Request, res: Response) => {
    try {
        const { emblemId } = req.params;

        if (!emblemId || typeof emblemId !== 'string') {
            return ApiResponseBuilder.error(res, 400, {
                message: 'Invalid emblem ID',
                error: 'validation_error'
            });
        }

        const roles = req.user?.protocol?.roles || [];
        const isFounder = roles.some((role: any) => {
            const roleName = typeof role === 'string' ? role : role.roleName || role.name;
            return roleName?.toUpperCase() === 'FOUNDER';
        });

        const selectFields = isFounder
            ? 'emblemId name description image code rarity status createdAt updatedAt'
            : 'emblemId name description image rarity status createdAt updatedAt';

        const emblem = await EmblemModel.findOne({ emblemId })
            .select(selectFields)
            .lean();

        if (!emblem) {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Emblem not found',
                error: 'not_found'
            });
        }

        if (!isFounder && emblem.status !== 'AVAILABLE') {
            return ApiResponseBuilder.error(res, 404, {
                message: 'Emblem not found',
                error: 'not_found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Emblem retrieved successfully',
            data: emblem
        });

    } catch (error: any) {
        logger.error('Error retrieving emblem:', {
            emblemId: req.params.emblemId,
            error: error.message,
            stack: error.stack
        });

        return ApiResponseBuilder.error(res, 500, {
            message: 'Internal server error',
            error: 'internal_server_error'
        });
    }
};
