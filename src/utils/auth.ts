import crypto from 'crypto';
import jwt, { SignOptions } from 'jsonwebtoken';
import { IAgent, IAgentDocument } from '../types/agent';
import { AUTH_CONSTANTS } from './constants';


export function generateState(): string {
    return crypto.randomBytes(32).toString('hex');
}

export function generateJWT(
    payload: string | object | Buffer,
    expiresIn: string | number = process.env.JWT_EXPIRES_IN || '24h'
): string {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    return jwt.sign(payload, secret, { expiresIn: expiresIn as SignOptions['expiresIn'] });
}

export function verifyJWT(token: string): any {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');
    try {
        return jwt.verify(token, secret);
    } catch (err: any) {
        if (err.name === 'TokenExpiredError') throw new Error('TOKEN_EXPIRED');
        throw new Error('TOKEN_INVALID');
    }
}

export const createJWTPayload = (agent: IAgentDocument) => {
    if (!agent._id) throw new Error('Agent ID missing');
    return {
        agentId: agent._id.toString(),
        bungieId: agent.bungieId,
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
            message: 'Token required',
            error: 'missing_token'
        };
    }

    if (token.length > AUTH_CONSTANTS.MAX_TOKEN_LENGTH) {
        return {
            valid: false,
            message: 'Token too long',
            error: 'invalid_token_length'
        };
    }

    if (!token.includes('.') || token.split('.').length !== 3) {
        return {
            valid: false,
            message: 'Invalid token format',
            error: 'invalid_token_format'
        };
    }

    return { valid: true, message: 'Token valid' };
};