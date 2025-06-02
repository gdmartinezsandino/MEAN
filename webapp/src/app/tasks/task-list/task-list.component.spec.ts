import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { TaskListComponent } from './task-list.component';
import { ActivatedRouteSnapshot, convertToParamMap } from '@angular/router';
import { of, Subject } from 'rxjs';
import { TaskService } from '../services/tasks.service';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Task } from '../models/task.model';

describe('TaskListComponent', () => {
  let component: TaskListComponent;
  let fixture: ComponentFixture<TaskListComponent>;
  let taskServiceSpy: jasmine.SpyObj<TaskService>;
  let dialogSpy: jasmine.SpyObj<MatDialog>;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;
  let routerEventsSubject: Subject<any>;
  let routerSpy: jasmine.SpyObj<Router>;
  let activatedRouteStub: Partial<ActivatedRoute>;

  const mockTasks: Task[] = [
    {
      _id: '1',
      title: 'Test Task 1',
      dueDate: '2025-06-01',
      priority: 'High',
      status: 'Pending',
      tags: ['Angular'],
      history: [],
    },
    {
      _id: '2',
      title: 'Test Task 2',
      dueDate: '2025-06-02',
      priority: 'Low',
      status: 'Completed',
      tags: ['Angular', 'UnitTest'],
      history: [],
    },
  ];

  beforeEach(async () => {
    taskServiceSpy = jasmine.createSpyObj('TaskService', ['getTasks', 'addTask', 'updateTask', 'deleteTask']);
    dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    routerEventsSubject = new Subject();
    routerSpy = jasmine.createSpyObj('Router', ['navigate'], { events: routerEventsSubject.asObservable(), url: '/tasks' });


    await TestBed.configureTestingModule({
      declarations: [TaskListComponent],
      providers: [
        { provide: TaskService, useValue: taskServiceSpy },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: MatSnackBar, useValue: snackBarSpy },
        { provide: Router, useValue: routerSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskListComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('ngOnInit', () => {
    it('should call getTasks()', () => {
      taskServiceSpy.getTasks.and.returnValue(of(mockTasks));
      component.ngOnInit();
      expect(taskServiceSpy.getTasks).toHaveBeenCalled();
    });

    it('should handle route /new by calling handlerAddTask()', fakeAsync(() => {
      spyOn(component, 'handlerAddTask');
      routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
        events: routerEventsSubject.asObservable(),
        url: '/tasks/new',
      });
      
      component.ngOnInit();
      routerEventsSubject.next(new NavigationEnd(1, '/tasks', '/tasks/new'));
      tick();
      expect(component.handlerAddTask).toHaveBeenCalled();
    }));

    it('should call handlerEditTask when URL has /edit and ID', fakeAsync(() => {
      spyOn(component, 'handlerEditTask');
      routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
        events: routerEventsSubject.asObservable(),
        url: '/tasks/1/edit',
      });
      component.ngOnInit();
      routerEventsSubject.next(new NavigationEnd(1, '/tasks', '/tasks/1/edit'));
      tick();
      expect(component.handlerEditTask).toHaveBeenCalledWith('1');
    }));

    it('should call openHistoryDialog when URL has /history and ID', fakeAsync(() => {
      spyOn(component, 'openHistoryDialog');
      routerSpy = jasmine.createSpyObj('Router', ['navigate'], {
        events: routerEventsSubject.asObservable(),
        url: '/tasks/1/history',
      });
      component.ngOnInit();
      routerEventsSubject.next(new NavigationEnd(1, '/tasks', '/tasks/1/history'));
      tick();
      expect(component.openHistoryDialog).toHaveBeenCalledWith('1');
    }));
  });

  describe('getTasks', () => {
    it('should populate tasks and call applyFilters()', () => {
      spyOn(component, 'applyFilters');
      taskServiceSpy.getTasks.and.returnValue(of(mockTasks));
      component.getTasks();
      expect(component.tasks.length).toBe(2);
      expect(component.applyFilters).toHaveBeenCalled();
    });
  });

  describe('applyFilters', () => {
    it('should filter tasks based on status, priority, tags, and searchTerm', () => {
      component.tasks = mockTasks;
      component.filterStatus = 'Completed';
      component.filterPriority = 'Low';
      component.filterTags = ['UnitTest'];
      component.searchTerm = 'Test Task 2';
      component.applyFilters();
      expect(component.filteredTasks.length).toBe(1);
      expect(component.filteredTasks[0]._id).toBe('2');
    });
  });

  describe('handlerDeleteTask', () => {
    it('should call deleteTask on confirm and refresh the list', fakeAsync(() => {
      const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
      dialogRefSpy.afterClosed.and.returnValue(of(true));
      dialogSpy.open.and.returnValue(dialogRefSpy);
      taskServiceSpy.deleteTask.and.returnValue(of(void 0));
      taskServiceSpy.getTasks.and.returnValue(of([]));

      component.handlerDeleteTask('1');
      tick();

      expect(taskServiceSpy.deleteTask).toHaveBeenCalledWith('1');
      expect(snackBarSpy.open).toHaveBeenCalledWith('Task deleted successfully', 'Close', jasmine.any(Object));
    }));
  });
});
