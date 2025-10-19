import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IAgent } from '../types/agent';
import { AUTH_CONSTANTS } from './constants';


export function generateState(): string {
    return crypto.randomBytes(32).toString('hex');
}

export function generateJWT(
    payload: string | object | Buffer,
    expiresIn: string | number = AUTH_CONSTANTS.TOKEN_EXPIRY
): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET not configured');
    }

    return jwt.sign(payload, secret, { expiresIn: expiresIn as any });
}

export function verifyJWT(token: string): any {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
        throw new Error('JWT_SECRET not configured');
    }
    return jwt.verify(token, secret);
}

export const createJWTPayload = (agent: IAgent) => {
    if (!agent._id) {
        throw new Error('Agent ID missing');
    }

    if (!agent.protocol?.agentName || !agent.protocol?.role) {
        throw new Error('Agent protocol incomplete');
    }

    return {
        agentId: agent._id.toString(),
        bungieId: agent.bungieId
    };
};

export interface JWTValidationResult {
    valid: boolean;
    message: string;
    error?: string;
}

export const validateJWTFormat = (token: string): JWTValidationResult => {
    if (!token || typeof token !== 'string' || token.trim().length === 0) {
        return {
            valid: false,
            message: 'Token requis',
            error: 'missing_token'
        };
    }

    if (token.length > AUTH_CONSTANTS.MAX_TOKEN_LENGTH) {
        return {
            valid: false,
            message: 'Token trop long',
            error: 'invalid_token_length'
        };
    }

    if (!token.includes('.') || token.split('.').length !== 3) {
        return {
            valid: false,
            message: 'Format de token invalide',
            error: 'invalid_token_format'
        };
    }

    return { valid: true, message: 'Token valide' };
};