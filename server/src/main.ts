import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/http-exception.filter';
import { TasksSeeder } from './tasks/services/tasks.seeder.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Basic setup for application
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

  // Adding global filters
  app.useGlobalFilters(new AllExceptionsFilter());

  // Runing seed service to add dummy data
  const seeder = app.get(TasksSeeder);
  await seeder.seed();

  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');
  console.log('Swagger docs available at: http://localhost:3000/api');
}
bootstrap();
