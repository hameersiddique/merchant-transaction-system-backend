import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getLoggerConfig } from './logger.config';
import { LogLevel } from 'src/common/enums';

@Injectable()
export class LoggerService implements NestLoggerService {
    private context?: string;
    private readonly config: ReturnType<typeof getLoggerConfig>;
    private readonly colors = {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        yellow: '\x1b[33m',
        green: '\x1b[32m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        gray: '\x1b[90m',
    };

    constructor(private readonly configService: ConfigService) {
        const nodeEnv = this.configService.get<string>('NODE_ENV', 'development');
        this.config = getLoggerConfig(nodeEnv);
    }

    setContext(context: string) {
        this.context = context;
    }

    log(message: string, context?: string) {
        this.printMessage('info', message, context);
    }

    error(message: string, trace?: string, context?: string) {
        this.printMessage('error', message, context, trace);
    }

    warn(message: string, context?: string) {
        this.printMessage('warn', message, context);
    }

    debug(message: string, context?: string) {
        if (this.config.level === LogLevel.DEBUG) {
            this.printMessage('debug', message, context);
        }
    }

    verbose(message: string, context?: string) {
        this.printMessage('debug', message, context);
    }

    private printMessage(
        level: 'info' | 'error' | 'warn' | 'debug',
        message: string,
        context?: string,
        trace?: string,
    ) {
        const ctx = context || this.context || 'Application';
        const timestamp = this.config.timestamp ? this.getTimestamp() : '';
        const coloredLevel = this.colorize(level);
        const coloredContext = this.config.colorize
            ? `${this.colors.cyan}[${ctx}]${this.colors.reset}`
            : `[${ctx}]`;

        const formattedMessage = this.formatMessage(message);

        if (this.config.prettyPrint) {
            console.log(
                `${timestamp} ${coloredLevel} ${coloredContext} ${formattedMessage}`,
            );
            if (trace) {
                console.log(
                    `${this.config.colorize ? this.colors.red : ''}${trace}${this.config.colorize ? this.colors.reset : ''}`,
                );
            }
        } else {
            const logObject = {
                timestamp: new Date().toISOString(),
                level,
                context: ctx,
                message: formattedMessage,
                ...(trace && { trace }),
            };
            console.log(JSON.stringify(logObject));
        }
    }

    private formatMessage(message: unknown): string {
        if (typeof message === 'string') {
            return message;
        }
        if (message instanceof Error) {
            return message.message;
        }
        try {
            return JSON.stringify(message);
        } catch {
            return String(message);
        }
    }

    private colorize(level: string): string {
        if (!this.config.colorize) return `[${level.toUpperCase()}]`;

        const colorMap = {
            error: this.colors.red,
            warn: this.colors.yellow,
            info: this.colors.green,
            debug: this.colors.magenta,
        };

        const color = colorMap[level] || this.colors.reset;
        return `${color}[${level.toUpperCase()}]${this.colors.reset}`;
    }

    private getTimestamp(): string {
        const now = new Date();
        const date = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
        });
        const time = now.toLocaleTimeString('en-US', {
            hour12: false,
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
        });

        const timestamp = `${date} ${time}`;
        return this.config.colorize
            ? `${this.colors.gray}${timestamp}${this.colors.reset}`
            : timestamp;
    }
}