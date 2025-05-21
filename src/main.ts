import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Set up Swagger
  const config = new DocumentBuilder()
    .setTitle('Portfolio API')
    .setDescription('API for my personal portfolio')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, documentFactory);

  // Set up port
  const port = process.env.PORT ? parseInt(process.env.PORT) : 3000;
  Logger.log(`Starting server on port ${port}`, 'Bootstrap');
  await app.listen(port);
}
bootstrap();
