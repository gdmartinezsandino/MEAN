import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TasksService } from './services/tasks.service';
import { TasksController } from './controllers/tasks.controller';
import { TaskSchema } from './schemas/task.schema';
import { TasksSeeder } from './services/tasks.seeder.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Task', schema: TaskSchema }])],
  controllers: [TasksController],
  providers: [TasksService, TasksSeeder],
  exports: [TasksSeeder],
})
export class TasksModule {}
