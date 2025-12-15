import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';

const levels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4,
};

const colors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'cyan',
};

winston.addColors(colors);

const level = () => {
    const env = process.env.NODE_ENV || 'development';
    const isDevelopment = env === 'development';
    return isDevelopment ? 'debug' : 'info';
};

const consoleFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.colorize({ all: true }),
    winston.format.printf(({ timestamp, level, message, ...metadata }) => {
        let msg = `${timestamp} [${level}]: ${message}`;

        if (Object.keys(metadata).length > 0) {
            const cleanMeta = { ...metadata };
            delete cleanMeta.service;

            if (Object.keys(cleanMeta).length > 0) {
                msg += ` ${JSON.stringify(cleanMeta)}`;
            }
        }
        return msg;
    })
);

const fileFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

const transports: winston.transport[] = [];

// Console uniquement en développement (performance en prod)
if (process.env.NODE_ENV !== 'production') {
    transports.push(
        new winston.transports.Console({
            format: consoleFormat,
        })
    );
}

if (process.env.NODE_ENV !== 'test') {
    const logsDir = path.join(process.cwd(), 'logs');

    transports.push(
        new DailyRotateFile({
            filename: path.join(logsDir, 'error-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'error',
            format: fileFormat,
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true,
        })
    );

    transports.push(
        new DailyRotateFile({
            filename: path.join(logsDir, 'combined-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            format: fileFormat,
            maxSize: '20m',
            maxFiles: '14d',
            zippedArchive: true,
        })
    );

    transports.push(
        new DailyRotateFile({
            filename: path.join(logsDir, 'http-%DATE%.log'),
            datePattern: 'YYYY-MM-DD',
            level: 'http',
            format: fileFormat,
            maxSize: '20m',
            maxFiles: '7d',
            zippedArchive: true,
        })
    );
}

const logger = winston.createLogger({
    level: level(),
    levels,
    defaultMeta: { service: 'AN0M-API' },
    transports,
    exitOnError: false,
});

export const httpLogStream = {
    write: (message: string) => {
        logger.http(message.trim());
    },
};

export const createContextLogger = (context: string) => {
    return {
        error: (message: string, meta?: object) => logger.error(message, { context, ...meta }),
        warn: (message: string, meta?: object) => logger.warn(message, { context, ...meta }),
        info: (message: string, meta?: object) => logger.info(message, { context, ...meta }),
        http: (message: string, meta?: object) => logger.http(message, { context, ...meta }),
        debug: (message: string, meta?: object) => logger.debug(message, { context, ...meta }),
    };
};

export default logger;

export const logError = (message: string, meta?: object) => logger.error(message, meta);
export const logWarn = (message: string, meta?: object) => logger.warn(message, meta);
export const logInfo = (message: string, meta?: object) => logger.info(message, meta);
export const logDebug = (message: string, meta?: object) => logger.debug(message, meta);
export const logHttp = (message: string, meta?: object) => logger.http(message, meta);
