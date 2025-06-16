import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import {
  ResponseTransformInterceptor,
  GlobalExceptionFilter,
  ValidationPipe,
} from './core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set up global pipes, interceptors, and filters
  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalInterceptors(new ResponseTransformInterceptor());
  app.useGlobalFilters(new GlobalExceptionFilter());

  // Set up Swagger

  const config = new DocumentBuilder()
    .setTitle('Portfolio API')
    .setDescription('API for my personal portfolio')
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      name: 'Authorization',
      description: 'Enter JWT token',
      in: 'header',
    })
    .addApiKey({
      type: 'apiKey',
      name: 'x-api-key',
      in: 'header',
      description: 'Paste your API key here',
    }, 'x-api-key')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  // Set up port
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  Logger.log(`Starting server on port ${port}`, 'Bootstrap');
  await app.listen(port);
}

bootstrap().catch((err) => {
  Logger.error('Bootstrap failed', err);
  process.exit(1);
});
