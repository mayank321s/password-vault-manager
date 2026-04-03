import { Injectable, LoggerService, Scope } from '@nestjs/common';
import winston, { WinstonModule } from 'nest-winston';
import { AppConfig } from 'src/config/app.config';
import { format, transports } from 'winston';
import { piiRedactionFormat } from './redact-format';

type WinstonLogLevel =
  | 'error'
  | 'warn'
  | 'info'
  | 'http'
  | 'verbose'
  | 'debug'
  | 'silly';

@Injectable({ scope: Scope.TRANSIENT })
export class LoggingService {
  private logger: LoggerService;
  private logLevel: WinstonLogLevel;

  public constructor(config: AppConfig) {
    this.logLevel = config.logLevel;
    this.logger = WinstonModule.createLogger(
      this.getLoggerFormatOptions(this.logLevel, config.env === 'production'),
    );
  }

  private getLoggerFormatOptions(
    logLevel: WinstonLogLevel = 'info',
    isProduction: boolean,
  ): winston.WinstonModuleOptions {
    const colorizer = format.colorize();
    return {
      transports: [
        new transports.Console({
          level: logLevel,
          format: isProduction
            ? format.json()
            : format.combine(
                format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                format.printf((info, ...meta) => {
                  const data = Object.keys(meta)
                    .filter((key) => key.length > 1)
                    .map((key) => meta[key]);
                  return [
                    colorizer.colorize(info.level, info.level.toUpperCase()),
                    info.timestamp,
                    info.message,
                    info.error ? '\n' + (info.error as Error).stack : '',
                    ...piiRedactionFormat(data),
                  ]
                    .filter(Boolean)
                    .join(' | ');
                }),
              ),
        }),
      ],
    };
  }

  private logMessage(
    level: WinstonLogLevel = 'info',
    message: string | Error,
    data?: object,
  ) {
    const logData = {
      level,
      message: message instanceof Error ? message.message : message,
      error: message instanceof Error ? message : undefined,
      ...data,
    };
    this.logger.log(logData);
  }

  public log(message: string, data?: object) {
    this.logMessage('info', message, data);
  }

  public debug(message: string, data?: object) {
    this.logMessage('debug', message, data);
  }

  public warn(message: string | Error, data?: object) {
    this.logMessage('warn', message, data);
  }

  public error(message: string | Error, data?: object) {
    this.logMessage('error', message, data);
  }

  public verbose(message: string, data?: object) {
    this.logMessage('verbose', message, data);
  }
}
