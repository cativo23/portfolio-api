import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from './core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set up CORS
  const allowedOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',')
    : [
        'http://localhost:3000',
        'http://localhost:5173',
        'http://localhost:5174',
      ];

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, Postman, curl)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (
        allowedOrigins.includes(origin) ||
        process.env.NODE_ENV === 'development'
      ) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
  });

  // Set up global pipes
  // Note: Interceptors and filters are registered in AppModule using APP_INTERCEPTOR
  // and APP_FILTER tokens for proper DI support
  app.useGlobalPipes(new ValidationPipe());

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
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Paste your API key here',
      },
      'x-api-key',
    )
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
