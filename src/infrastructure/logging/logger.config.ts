export enum LogLevel {
    ERROR = 'error',
    WARN = 'warn',
    INFO = 'info',
    HTTP = 'http',
    DEBUG = 'debug',
}

export interface LoggerConfig {
    level: LogLevel;
    prettyPrint: boolean;
    timestamp: boolean;
    colorize: boolean;
    context?: string;
}

export const getLoggerConfig = (nodeEnv: string): LoggerConfig => {
    const isDevelopment = nodeEnv === 'development';

    return {
        level: isDevelopment ? LogLevel.DEBUG : LogLevel.INFO,
        prettyPrint: isDevelopment,
        timestamp: true,
        colorize: isDevelopment,
    };
};