import crypto from 'crypto';
import logger from './logger';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const ENCODING: BufferEncoding = 'base64';

function getEncryptionKey(): Buffer {
    const key = process.env.ENCRYPTION_KEY;
    if (!key) {
        throw new Error('ENCRYPTION_KEY environment variable is not set');
    }

    const keyBuffer = Buffer.from(key, 'hex');
    if (keyBuffer.length !== 32) {
        throw new Error('ENCRYPTION_KEY must be a 64-character hex string (32 bytes)');
    }

    return keyBuffer;
}

/**
 * Chiffre une valeur en AES-256-GCM.
 * Format de sortie : `iv:authTag:ciphertext` (base64)
 */
export function encryptField(plaintext: string): string {
    const key = getEncryptionKey();
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', ENCODING);
    encrypted += cipher.final(ENCODING);

    const authTag = cipher.getAuthTag();

    return `${iv.toString(ENCODING)}:${authTag.toString(ENCODING)}:${encrypted}`;
}

/**
 * Déchiffre une valeur chiffrée par `encryptField`.
 * Retourne `null` si le déchiffrement échoue.
 */
export function decryptField(encrypted: string): string | null {
    try {
        const key = getEncryptionKey();
        const [ivB64, authTagB64, ciphertext] = encrypted.split(':');

        if (!ivB64 || !authTagB64 || !ciphertext) {
            logger.warn('Invalid encrypted field format');
            return null;
        }

        const iv = Buffer.from(ivB64, ENCODING);
        const authTag = Buffer.from(authTagB64, ENCODING);
        const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
        decipher.setAuthTag(authTag);

        let decrypted = decipher.update(ciphertext, ENCODING, 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        logger.error('Decryption failed:', { error: message });
        return null;
    }
}

/**
 * Hash SHA-256 pour les lookups (doublons, recherche par code).
 * Déterministe : même input → même hash.
 */
export function hashField(plaintext: string): string {
    return crypto.createHash('sha256').update(plaintext).digest('hex');
}

/**
 * Vérifie si une valeur est déjà chiffrée (format iv:tag:cipher en base64).
 */
export function isEncrypted(value: string): boolean {
    const parts = value.split(':');
    if (parts.length !== 3) return false;

    try {
        Buffer.from(parts[0], ENCODING);
        Buffer.from(parts[1], ENCODING);
        Buffer.from(parts[2], ENCODING);
        return true;
    } catch {
        return false;
    }
}
