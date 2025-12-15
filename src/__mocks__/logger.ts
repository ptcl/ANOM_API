/**
 * Mock global pour le logger Winston
 * @file __mocks__/logger.ts
 * 
 * Ce fichier est automatiquement utilisé par Jest quand on fait:
 * jest.mock('../../utils/logger')
 */

const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
    http: jest.fn()
};

export const createContextLogger = jest.fn(() => mockLogger);
export const logInfo = jest.fn();
export const logError = jest.fn();
export const logWarn = jest.fn();
export const logDebug = jest.fn();
export const logHttp = jest.fn();
export const httpLogStream = { write: jest.fn() };

export default mockLogger;
