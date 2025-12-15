import logger from "./logger";

export type TimestampFormat =
    | 'iso'           // 2024-03-15T14:30:45.123Z
    | 'readable'      // 15 mars 2024 à 14:30:45
    | 'short'         // 15/03/2024 14:30
    | 'long'          // vendredi 15 mars 2024 à 14:30:45
    | 'relative'      // il y a 2 minutes
    | 'log'           // [2024-03-15 14:30:45]
    | 'api';          // 2024-03-15T14:30:45.123+01:00

export interface TimestampOptions {
    format?: TimestampFormat;
    locale?: string;
    timezone?: string;
    includeTime?: boolean;
    includeSeconds?: boolean;
    includeMilliseconds?: boolean;
}

class DateFormatter {
    private static instance: DateFormatter;
    private defaultLocale: string = 'fr-FR';
    private defaultTimezone: string = 'Europe/Paris';

    private constructor() { }

    public static getInstance(): DateFormatter {
        if (!DateFormatter.instance) {
            DateFormatter.instance = new DateFormatter();
        }
        return DateFormatter.instance;
    }

    public formatTimestamp(date?: Date | string | number, options: TimestampOptions = {}): string {
        try {
            const targetDate = this.parseDate(date);
            const {
                format = 'readable',
                locale = this.defaultLocale,
                timezone = this.defaultTimezone,
                includeTime = true,
                includeSeconds = true,
                includeMilliseconds = false
            } = options;

            switch (format) {
                case 'iso':
                    return targetDate.toISOString();

                case 'readable':
                    return this.formatReadable(targetDate, locale, timezone, includeTime, includeSeconds);

                case 'short':
                    return this.formatShort(targetDate, locale, timezone);

                case 'long':
                    return this.formatLong(targetDate, locale, timezone, includeSeconds);

                case 'relative':
                    return this.formatRelative(targetDate, locale);

                case 'log':
                    return this.formatLog(targetDate, includeMilliseconds);

                case 'api':
                    return this.formatApi(targetDate, timezone);

                default:
                    return this.formatReadable(targetDate, locale, timezone, includeTime, includeSeconds);
            }
        } catch (error) {
            logger.error('Error during date formatting', error);
            return new Date().toISOString();
        }
    }

    public formatForLog(date?: Date | string | number): string {
        return this.formatTimestamp(date, { format: 'log', includeMilliseconds: true });
    }

    public formatForApi(date?: Date | string | number): string {
        return this.formatTimestamp(date, { format: 'api' });
    }

    public formatForUser(date?: Date | string | number): string {
        return this.formatTimestamp(date, { format: 'readable' });
    }

    public formatRelativeTime(date?: Date | string | number): string {
        return this.formatTimestamp(date, { format: 'relative' });
    }

    private parseDate(date?: Date | string | number): Date {
        if (!date) {
            return new Date();
        }

        if (date instanceof Date) {
            return date;
        }

        if (typeof date === 'string' || typeof date === 'number') {
            const parsed = new Date(date);
            if (isNaN(parsed.getTime())) {
                throw new Error(`Invalid date: ${date}`);
            }
            return parsed;
        }

        throw new Error(`Unsupported date type: ${typeof date}`);
    }

    private formatReadable(date: Date, locale: string, timezone: string, includeTime: boolean, includeSeconds: boolean): string {
        const options: Intl.DateTimeFormatOptions = {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            timeZone: timezone,
        };

        if (includeTime) {
            options.hour = '2-digit';
            options.minute = '2-digit';
            if (includeSeconds) {
                options.second = '2-digit';
            }
        }

        return date.toLocaleDateString(locale, options).replace(' à ', ' à ');
    }

    private formatShort(date: Date, locale: string, timezone: string): string {
        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timezone,
        });
    }

    private formatLong(date: Date, locale: string, timezone: string, includeSeconds: boolean): string {
        const options: Intl.DateTimeFormatOptions = {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZone: timezone,
        };

        if (includeSeconds) {
            options.second = '2-digit';
        }

        return date.toLocaleDateString(locale, options);
    }

    private formatRelative(date: Date, locale: string): string {
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

        if (diffMs < 1000) {
            return 'à l\'instant';
        } else if (diffMs < 60000) {
            const seconds = Math.floor(diffMs / 1000);
            return `il y a ${seconds} seconde${seconds > 1 ? 's' : ''}`;
        } else if (diffMinutes < 60) {
            return `il y a ${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
        } else if (diffHours < 24) {
            return `il y a ${diffHours} heure${diffHours > 1 ? 's' : ''}`;
        } else if (diffDays < 7) {
            return `il y a ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
        } else {
            return this.formatReadable(date, locale, 'Europe/Paris', false, false);
        }
    }

    private formatLog(date: Date, includeMilliseconds: boolean): string {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        let formatted = `[${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        if (includeMilliseconds) {
            const milliseconds = String(date.getMilliseconds()).padStart(3, '0');
            formatted += `.${milliseconds}`;
        }

        formatted += ']';
        return formatted;
    }

    private formatApi(date: Date, timezone: string): string {
        return date.toLocaleDateString('sv-SE', {
            timeZone: timezone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        }).replace(' ', 'T') + this.getTimezoneOffset(date, timezone);
    }

    private getTimezoneOffset(date: Date, timezone: string): string {
        try {
            const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
            const localDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }));
            const offsetMs = localDate.getTime() - utcDate.getTime();
            const offsetHours = Math.floor(Math.abs(offsetMs) / (1000 * 60 * 60));
            const offsetMinutes = Math.floor((Math.abs(offsetMs) % (1000 * 60 * 60)) / (1000 * 60));
            const sign = offsetMs >= 0 ? '+' : '-';
            return `${sign}${String(offsetHours).padStart(2, '0')}:${String(offsetMinutes).padStart(2, '0')}`;
        } catch {
            return '+00:00';
        }
    }

    public setDefaultLocale(locale: string): void {
        this.defaultLocale = locale;
    }

    public setDefaultTimezone(timezone: string): void {
        this.defaultTimezone = timezone;
    }
}

const dateFormatter = DateFormatter.getInstance();

export const formatTimestamp = (date?: Date | string | number, options?: TimestampOptions): string =>
    dateFormatter.formatTimestamp(date, options);

export const formatForLog = (date?: Date | string | number): string =>
    dateFormatter.formatForLog(date);

export const formatForApi = (date?: Date | string | number): string =>
    dateFormatter.formatForApi(date);

export const formatForUser = (date?: Date | string | number): string =>
    dateFormatter.formatForUser(date);

export const formatRelativeTime = (date?: Date | string | number): string =>
    dateFormatter.formatRelativeTime(date);

export { dateFormatter };