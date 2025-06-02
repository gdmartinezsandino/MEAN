import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from '../interfaces/task.interface';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';
import { TaskStatus } from '../enums/task.enums';

@Injectable()
export class TasksService {
  constructor(@InjectModel('Task') private readonly taskModel: Model<Task>) {}

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const createdTask = new this.taskModel({
      ...createTaskDto,
      history: [
        {
          changes: `Task created with status ${createTaskDto.status}`,
        },
      ],
    });
    return createdTask.save();
  }

  async findAll(filters: {
    status?: string;
    priority?: string;
    tags?: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<Task[]> {
    const query: any = {};

    if (filters.status) query.status = filters.status;
    if (filters.priority) query.priority = filters.priority;
    if (filters.tags && filters.tags.length > 0) query.tags = { $in: filters.tags };
    if (filters.startDate || filters.endDate) {
      query.dueDate = {};
      if (filters.startDate) query.dueDate.$gte = new Date(filters.startDate);
      if (filters.endDate) query.dueDate.$lte = new Date(filters.endDate);
    }

    return this.taskModel.find(query).sort({ dueDate: 1 }).exec();
  }

  async findOne(id: string): Promise<Task | null> {
    return this.taskModel.findById(id).exec();
  }

  async update(id: string, updateDto: UpdateTaskDto): Promise<Task | null> {
    const existingTask = await this.taskModel.findById(id);
    if (!existingTask) return null;

    // Prevent invalid status transition
    if (existingTask.status === TaskStatus.Pending && updateDto.status === TaskStatus.Completed) {
      throw new BadRequestException('Cannot change status directly from Pending to Completed');
    }

    // store changes to history
    const changes: string[] = [];
    for (const key of Object.keys(updateDto) as (keyof UpdateTaskDto)[]) {
      const oldValue = existingTask[key];
      const newValue = updateDto[key];

      if (oldValue !== newValue) {
        changes.push(`${key} changed from ${oldValue} to ${newValue}`);
      }
    }

    existingTask.set(updateDto);
    if (changes.length) {
      existingTask.history.push({
        changes: changes.join('; '),
        changedAt: new Date(),
      });
    }

    return existingTask.save();
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.taskModel.findByIdAndDelete(id).exec();
    return !!result;
  }
}
