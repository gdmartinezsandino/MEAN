import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';

import { TasksController } from './tasks.controller';
import { TasksService } from '../services/tasks.service';
import { CreateTaskDto } from '../dto/create-task.dto';
import { TaskStatus } from '../enums/task.enums';

const mockTask = {
  title: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.Pending,
  priority: 'Medium',
  dueDate: new Date(),
  tags: ['test'],
};

describe('TasksController', () => {
  let controller: TasksController;
  let service: TasksService;

  const mockTasksService = {
    create: jest.fn().mockResolvedValue(mockTask),
    findAll: jest.fn().mockResolvedValue([mockTask]),
    findOne: jest.fn().mockResolvedValue(mockTask),
    update: jest.fn().mockResolvedValue(mockTask),
    remove: jest.fn().mockResolvedValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile();

    controller = module.get<TasksController>(TasksController);
    service = module.get<TasksService>(TasksService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should create a task', async () => {
    const dto: CreateTaskDto = {
      title: 'New Task',
      status: TaskStatus.Pending,
      dueDate: new Date().toISOString(),
      tags: ['urgent'],
    };

    const result = await controller.create(dto);
    expect(result).toEqual(mockTask);
  });

  it('should return all tasks', async () => {
    const result = await controller.findAll(undefined, undefined, undefined, undefined, undefined);
    expect(result).toEqual([mockTask]);
  });

  it('should return a task by ID', async () => {
    const result = await controller.findOne('1');
    expect(result).toEqual(mockTask);
  });

  it('should update a task', async () => {
    const updateDto = { title: 'Updated Task' };
    const result = await controller.update('1', updateDto);
    expect(result.title).toBe('Updated Task');
  });

  it('should remove a task', async () => {
    const result = await controller.remove('1');
    expect(result).toBeUndefined();
  });

  it('should throw NotFoundException if task not found on findOne', async () => {
    jest.spyOn(service, 'findOne').mockResolvedValue(null);
    await expect(controller.findOne('1')).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if task not found on update', async () => {
    jest.spyOn(service, 'update').mockResolvedValue(null);
    await expect(controller.update('1', {})).rejects.toThrow(NotFoundException);
  });

  it('should throw NotFoundException if task not found on remove', async () => {
    jest.spyOn(service, 'remove').mockResolvedValue(false);
    await expect(controller.remove('1')).rejects.toThrow(NotFoundException);
  });
});
