import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from '../interfaces/task.interface';
import { TaskStatus } from '../enums/task.enums';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

const mockTask = {
  title: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.Pending,
  priority: 'Medium',
  dueDate: new Date(),
  tags: ['test'],
  save: jest.fn(),
};

describe('TasksService', () => {
  let service: TasksService;
  let model: Model<Task>;

  const mockTaskModel = {
    new: jest.fn().mockResolvedValue(mockTask),
    constructor: jest.fn().mockResolvedValue(mockTask),
    find: jest.fn(),
    findById: jest.fn(),
    findByIdAndDelete: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken('Task'),
          useValue: mockTaskModel,
        },
      ],
    }).compile();

    service = module.get<TasksService>(TasksService);
    model = module.get<Model<Task>>(getModelToken('Task'));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should create a new task', async () => {
    const dto: CreateTaskDto = {
      title: 'New Task',
      status: TaskStatus.Pending,
      dueDate: new Date().toISOString(),
      tags: ['urgent'],
    };

    jest.spyOn(model.prototype, 'save').mockResolvedValue(mockTask as any);

    const result = await service.create(dto);
    expect(result).toEqual(mockTask);
  });

  it('should find all tasks', async () => {
    jest.spyOn(model, 'find').mockResolvedValue([mockTask] as any);

    const result = await service.findAll({});
    expect(result).toEqual([mockTask]);
  });

  it('should find a task by ID', async () => {
    jest.spyOn(model, 'findById').mockResolvedValue(mockTask as any);

    const result = await service.findOne('1');
    expect(result).toEqual(mockTask);
  });

  it('should update a task', async () => {
    const updateDto: UpdateTaskDto = { title: 'Updated Task' };
    jest.spyOn(model, 'findById').mockResolvedValue(mockTask as any);
    jest.spyOn(mockTask, 'save').mockResolvedValue(mockTask as any);

    const result = await service.update('1', updateDto);
    expect(result?.title).toBe('Updated Task');
  });

  it('should remove a task', async () => {
    jest.spyOn(model, 'findByIdAndDelete').mockResolvedValue(mockTask as any);

    const result = await service.remove('1');
    expect(result).toBe(true);
  });
});
