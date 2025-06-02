import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from '../interfaces/task.interface';
import { TaskStatus, TaskPriority } from '../enums/task.enums';

@Injectable()
export class TasksSeeder {
  private readonly logger = new Logger(TasksSeeder.name);

  constructor(@InjectModel('Task') private readonly taskModel: Model<Task>) {}

  async seed() {
    const count = await this.taskModel.countDocuments();
    if (count > 0) {
      this.logger.log('Skipping seeding — tasks already exist.');
      return;
    }

    const placeholderTasks: Partial<Task>[] = Array.from({ length: 50 }).map((_, index) => ({
      title: `Sample Task ${index + 1}`,
      description: `This is a placeholder description for task #${index + 1}`,
      status: this.getRandomStatus(),
      priority: this.getRandomPriority(),
      dueDate: this.randomFutureDate(),
      tags: this.getRandomTags(),
      history: [
        {
          changedAt: new Date(),
          changes: 'Initial seeding',
        },
      ],
    }));

    await this.taskModel.insertMany(placeholderTasks);
    this.logger.log('Seeded 50 placeholder tasks into the database.');
  }

  private getRandomStatus(): TaskStatus {
    const statuses = [TaskStatus.Pending, TaskStatus.InProgress, TaskStatus.Completed];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private getRandomPriority(): TaskPriority {
    const priorities = [TaskPriority.Low, TaskPriority.Medium, TaskPriority.High];
    return priorities[Math.floor(Math.random() * priorities.length)];
  }

  private getRandomTags(): string[] {
    const tagPool = ['frontend', 'backend', 'api', 'bug', 'urgent', 'feature'];
    const count = Math.floor(Math.random() * 3);
    return Array.from({ length: count }, () =>
      tagPool[Math.floor(Math.random() * tagPool.length)],
    ).filter((v, i, a) => a.indexOf(v) === i); // unique
  }

  private randomFutureDate(): Date {
    const now = new Date();
    const daysAhead = Math.floor(Math.random() * 30) + 1;
    now.setDate(now.getDate() + daysAhead);
    return now;
  }
}
