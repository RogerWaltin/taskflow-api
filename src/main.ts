import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { ConfigService } from '@nestjs/config';
import { configureApp } from './app.setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  // Configure application
  configureApp(app);

  // Retrieve validated configuration
  const configService = app.get(ConfigService);
  const port = configService.getOrThrow<number>('PORT');

  // Configure Swagger
  const config = new DocumentBuilder()
    .setTitle('TaskFlow API')
    .setDescription('API documentation for the TaskFlow application')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('docs', app, document);

  await app.listen(port);
}

bootstrap().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
