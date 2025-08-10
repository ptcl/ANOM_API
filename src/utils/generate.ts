import crypto from 'crypto';

export function generateUniqueId(prefix: string = 'ANN'): string {
    const date = new Date();
    const dateStr = date.toISOString().slice(0, 10).replace(/-/g, '');
    const random = crypto.randomBytes(3).toString('hex');
    return `${prefix}-${dateStr}-${random}`;
}