import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TasksSeeder } from './tasks/services/tasks.seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.enableCors();

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('AAAMB Tasks API')
    .setDescription('CRUD API for tasks application')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // Adding filters
  app.useGlobalFilters(new AllExceptionsFilter());

  const seeder = app.get(TasksSeeder);
  console.log('[main.ts] Seeding started...');
  await seeder.seed();
  console.log('[main.ts] Seeding finished.');

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
  console.log('Swagger docs available at: http://localhost:3000/api');
}
bootstrap();
