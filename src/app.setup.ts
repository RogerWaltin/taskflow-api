import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import { json } from 'express';

const PROTOTYPE_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function configureApp(app: INestApplication): void {
  // Global API prefix
  app.setGlobalPrefix('api');

  // URI versioning
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: '1',
  });

  // Reject prototype-sensitive JSON keys while parsing, before class-
  // transformer can discard them and before any controller is reached.
  app.use(
    json({
      reviver(key, value) {
        if (PROTOTYPE_KEYS.has(key)) {
          throw Object.assign(
            new Error('Prototype-sensitive properties are not allowed'),
            { status: 400 },
          );
        }
        return value;
      },
    }),
  );

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: false,
      },
    }),
  );
}
