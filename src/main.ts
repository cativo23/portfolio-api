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
    .setDescription(
      `API for my personal portfolio

## Response Format

All responses follow a standardized format:

### Success Response
\`\`\`json
{
  "status": "success",
  "request_id": "req_88229911aabb",
  "data": { ... },
  "meta": { "pagination": { ... } } // Optional, only for paginated responses
}
\`\`\`

### Error Response
\`\`\`json
{
  "status": "error",
  "request_id": "req_88229911aabb",
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }, // Optional
    "path": "/api/v1/endpoint",
    "timestamp": "2026-01-08T14:05:00Z"
  }
}
\`\`\`

### Request ID

Every response includes a \`request_id\` field that can be used for:
- Tracking requests in logs
- Correlating errors with logs
- Reporting issues to support

Include the \`request_id\` when reporting errors.

### Pagination

Paginated endpoints include \`meta.pagination\` with:
- \`page\`: Current page number
- \`limit\`: Items per page
- \`total_items\`: Total number of items
- \`total_pages\`: Total number of pages`,
    )
    .setVersion('1.0')
    .addServer('http://localhost:3001', 'Development')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'bearer',
    )
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Paste your API key here',
      },
      'x-api-key',
    )
    .addTag('Projects', 'Project management endpoints')
    .addTag('Contacts', 'Contact form endpoints')
    .addTag('Auth', 'Authentication endpoints')
    .addTag('api-keys', 'API key management endpoints')
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory, {
    swaggerOptions: {
      persistAuthorization: true, // Keep auth token in Swagger UI
      displayRequestDuration: true, // Show request duration
      filter: true, // Enable filter/search
      showExtensions: true,
      showCommonExtensions: true,
    },
    customSiteTitle: 'Portfolio API Documentation',
  });

  // Set up port
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  Logger.log(`Starting server on port ${port}`, 'Bootstrap');
  await app.listen(port);
}

bootstrap().catch((err) => {
  Logger.error('Bootstrap failed', err);
  process.exit(1);
});
