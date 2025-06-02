import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';

import { TaskService } from './tasks.service';
import { Task } from '../models/task.model';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const mockTasks: Task[] = [
    { _id: '1', title: 'Task 1', description: 'Desc 1', status: 'Pending', priority: 'Low', dueDate: new Date().toString(), tags: [], history: [] },
    { _id: '2', title: 'Task 2', description: 'Desc 2', status: 'Completed', priority: 'High', dueDate: new Date().toString(), tags: ['api'], history: [] },
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService],
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify(); // Verify no outstanding HTTP requests
  });

  it('should fetch tasks with GET', () => {
    service.getTasks().subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(mockTasks);
    });

    const req = httpMock.expectOne('http://localhost:3000/tasks');
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('should add a task with POST without _id and history', () => {
    const newTask: Task = { _id: '3', title: 'New Task', description: 'Desc', status: 'Pending', priority: 'Medium', dueDate: new Date().toString(), tags: ['feature'], history: [{ timestamp: new Date(), changes: 'initial' }] };

    service.addTask({ ...newTask }).subscribe((task: Task) => {
      expect(task).toEqual(newTask);
    });

    const req = httpMock.expectOne('http://localhost:3000/tasks');
    expect(req.request.method).toBe('POST');

    // _id and history should be removed from request body
    expect(req.request.body._id).toBeUndefined();
    expect(req.request.body.history).toBeUndefined();
    expect(req.request.body.title).toBe(newTask.title);

    req.flush(newTask);
  });

  it('should update a task with PUT without _id and history', () => {
    const taskToUpdate: Task = { _id: '1', title: 'Updated Task', description: 'Updated Desc', status: 'In Progress', priority: 'High', dueDate: new Date().toString(), tags: ['bug'], history: [] };

    service.updateTask({ ...taskToUpdate }).subscribe(task => {
      expect(task).toEqual(taskToUpdate);
    });

    const req = httpMock.expectOne(`http://localhost:3000/tasks/${taskToUpdate._id}`);
    expect(req.request.method).toBe('PUT');

    expect(req.request.body._id).toBeUndefined();
    expect(req.request.body.history).toBeUndefined();
    expect(req.request.body.title).toBe(taskToUpdate.title);

    req.flush(taskToUpdate);
  });

  it('should delete a task with DELETE', () => {
    const id = '1';

    service.deleteTask(id).subscribe(response => {
      expect(response).toBeUndefined(); // void response
    });

    const req = httpMock.expectOne(`http://localhost:3000/tasks/${id}`);
    expect(req.request.method).toBe('DELETE');
    req.flush(null);
  });

  it('should get task history with GET', () => {
    const id = '1';
    const mockHistory = [
      { changedAt: new Date(), changes: 'Created' },
      { changedAt: new Date(), changes: 'Status changed' },
    ];

    service.getTaskHistory(id).subscribe((history: any) => {
      expect(history.length).toBe(2);
      expect(history).toEqual(mockHistory);
    });

    const req = httpMock.expectOne(`http://localhost:3000/tasks/${id}/history`);
    expect(req.request.method).toBe('GET');
    req.flush(mockHistory);
  });
});
