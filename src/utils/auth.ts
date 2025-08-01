import crypto from 'crypto';
import jwt from 'jsonwebtoken';

export function generateState() {
    return crypto.randomBytes(32).toString('hex');
}

export function generateJWT(payload: any, expiresIn: string = '24h') {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    return (jwt as any).sign(payload, secret, { expiresIn });
}

export function verifyJWT(token: string) {
    const secret = process.env.JWT_SECRET;
    if (!secret) throw new Error('JWT_SECRET not configured');

    return (jwt as any).verify(token, secret);
}