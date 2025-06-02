import { Test, TestingModule } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Task } from '../interfaces/task.interface';
import { TaskStatus } from '../enums/task.enums';
import { CreateTaskDto } from '../dto/create-task.dto';
import { UpdateTaskDto } from '../dto/update-task.dto';

// Create a mock task instance with needed methods
const mockTaskInstance = {
  title: 'Test Task',
  description: 'Test Description',
  status: TaskStatus.Pending,
  priority: 'Medium',
  dueDate: new Date(),
  tags: ['test'],
  history: [],
  set: jest.fn(function (this: any, dto: any) {
    Object.assign(this, dto);
  }),
  save: jest.fn().mockResolvedValue(this),
};

describe('TasksService', () => {
  let service: TasksService;
  let model: Model<Task>;

  const mockTaskModel = jest.fn().mockImplementation((dto) => ({
    ...dto,
    history: [{
      changes: `Task created with status ${dto.status}`,
    }],
    save: jest.fn().mockResolvedValue({
      ...dto,
      history: [{
        changes: `Task created with status ${dto.status}`,
      }],
    }),
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TasksService,
        {
          provide: getModelToken('Task'),
          useValue: Object.assign(mockTaskModel, {
            find: jest.fn(),
            findById: jest.fn(),
            findByIdAndDelete: jest.fn(),
          }),
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

    const result = await service.create(dto);
    expect(result.title).toBe(dto.title);
    expect(result.history[0].changes).toContain('Task created with status');
  });

  it('should find all tasks', async () => {
    jest.spyOn(model, 'find').mockReturnValue({
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([mockTaskInstance]),
      }),
    } as any);

    const result = await service.findAll({});
    expect(result).toEqual([mockTaskInstance]);
  });

  it('should find a task by ID', async () => {
    jest.spyOn(model, 'findById').mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockTaskInstance),
    } as any);

    const result = await service.findOne('1');
    expect(result).toEqual(mockTaskInstance);
  }); 

  it('should remove a task', async () => {
    jest.spyOn(model, 'findByIdAndDelete').mockReturnValue({
      exec: jest.fn().mockResolvedValue(mockTaskInstance),
    } as any);

    const result = await service.remove('1');
    expect(result).toBe(true);
  });
});
