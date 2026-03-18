import { NestFactory } from '@nestjs/core';
import { AppModule } from '@src/app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';
import { ValidationPipe } from '@core';
import { loadAppConfig } from '@config/configuration.loaders';
import { ClsMiddleware } from 'nestjs-cls';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Mount CLS middleware first - before any other middleware that depends on it
  // This ensures CLS context is available for RequestIdMiddleware and others
  app.use(new ClsMiddleware({}).use);

  const appConfig = loadAppConfig();

  // Security headers — CSP configured to allow Swagger UI
  app.use(
    helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: [`'self'`],
          styleSrc: [`'self'`, `'unsafe-inline'`],
          imgSrc: [`'self'`, 'data:', 'validator.swagger.io'],
          scriptSrc: [`'self'`, `https: 'unsafe-inline'`],
        },
      },
    }),
  );

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        return callback(null, true);
      }

      if (
        appConfig.corsOrigins.includes(origin) ||
        appConfig.nodeEnv === 'development'
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

  // Global API prefix for versioning
  app.setGlobalPrefix('api/v1', {
    exclude: ['health', 'docs', '/'],
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
    .addServer(`http://localhost:${appConfig.port}`, 'Development')
    .addServer('https://api.cativo.dev', 'Production')
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

  const port = appConfig.port;
  Logger.log(`Starting server on port ${port}`, 'Bootstrap');
  await app.listen(port);
}

bootstrap().catch((err) => {
  Logger.error('Bootstrap failed', err);
  process.exit(1);
});
