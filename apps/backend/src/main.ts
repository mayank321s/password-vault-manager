import { NestFactory } from '@nestjs/core';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { LoggingService } from './common/logger/logger.service';
import { AppConfig } from './config/app.config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { NextFunction } from 'express';
import { IncomingMessage, ServerResponse } from 'http';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    logger: ['warn', 'error'],
  });
  app.useLogger(await app.resolve(LoggingService));

  const appConfig = app.get(AppConfig);

  // Use Winston logger
  const logger = await app.resolve(LoggingService);

  // Apply Helmet security headers
  const defaultHelmet = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    hsts: {
      maxAge: 31536000, // 1 year
      includeSubDomains: true,
      preload: true,
    },
    frameguard: {
      action: 'deny',
    },
    xssFilter: true,
    noSniff: true,
    referrerPolicy: {
      policy: 'strict-origin-when-cross-origin',
    },
    hidePoweredBy: true,
    ieNoOpen: true,
    dnsPrefetchControl: {
      allow: false,
    },
  });

  const docsHelmet = helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ['*'],
        fontSrc: ["'self'"],
        objectSrc: ["'none'"],
        mediaSrc: ["'self'"],
        frameSrc: ["'none'"],
      },
    },
    crossOriginEmbedderPolicy: false,
  });

  app.use((req: IncomingMessage, res: ServerResponse, next: NextFunction) => {
    if (req.url && req.url.startsWith('/api/v1/docs')) {
      docsHelmet(req, res, next);
    } else {
      defaultHelmet(req, res, next);
    }
  });

  app.enableCors(
    (
      req: IncomingMessage,
      callback: (error: string, options?: CorsOptions) => void,
    ) => {
      let corsOptions: CorsOptions;
      if (req.url && req.url.startsWith('/api/v1/docs')) {
        corsOptions = { origin: '*' };
      } else {
        corsOptions = {
          origin: appConfig.frontendUrl,
          credentials: true,
          methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
          allowedHeaders: [
            'Content-Type',
            'Authorization',
            'X-Requested-With',
            'Accept',
            'X-Organization-Id',
          ],
          exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
          maxAge: 3600, // 1 hour
          optionsSuccessStatus: 204,
        };
      }
      callback(null, corsOptions);
    },
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Password Manager')
    .setDescription(`Password Manager API documentation`)
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig, {
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api/v1/docs', app, document);

  await app.listen(appConfig.port);

  logger.debug(`Application is running on: http://localhost:${appConfig.port}`);
}

void bootstrap();
