import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get ConfigService
  const configService = app.get(ConfigService);

  // Global Prefix
  const apiPrefix = configService.get<string>('API_PREFIX') || 'api/v1';
  app.setGlobalPrefix(apiPrefix);

  // CORS Configuration
  app.enableCors();

  // Global Interceptor
  app.useGlobalInterceptors(new TransformInterceptor());

  // Global Exception Filter
  app.useGlobalFilters(new AllExceptionsFilter());

  // 4. Global Validation Pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger Configuration
  if (configService.get('NODE_ENV') !== 'production') {
    const config = new DocumentBuilder()
      .setTitle('Torino Dessert API')
      .setDescription('The API documentation for Torino Dessert backend')
      .setVersion('1.0')
      .addBearerAuth() // عشان لما نضيف نظام الـ Login بعدين
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  // Start the Application
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  console.log(`Application is running on: http://localhost:${port}/${apiPrefix}/health`);
  if (configService.get('NODE_ENV') !== 'production') {
    console.log(`Swagger documentation is available on: http://localhost:${port}/${apiPrefix}/docs`);
  }
}
bootstrap();