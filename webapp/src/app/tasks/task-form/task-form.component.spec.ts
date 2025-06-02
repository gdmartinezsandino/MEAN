import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskFormComponent } from './task-form.component';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Task } from '../models/task.model';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<TaskFormComponent>>;

  const mockTask: Task = {
    _id: '1',
    title: 'Test Task',
    dueDate: new Date(Date.now() + 86400000).toISOString(), // tomorrow
    status: 'In Progress',
    priority: 'High',
    tags: ['angular', 'unit'],
    history: [],
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      declarations: [TaskFormComponent],
      imports: [
        ReactiveFormsModule,
        FormsModule,
        NoopAnimationsModule,
        MatFormFieldModule,
        MatInputModule,
      ],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: { isEdit: true, task: mockTask },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should initialize form with provided task in edit mode', () => {
    expect(component.taskForm).toBeTruthy();
    expect(component.taskForm.value.title).toBe(mockTask.title);
    expect(component.taskForm.value.status).toBe(mockTask.status);
    expect(component.tags.length).toBe(2); // 'angular' and 'unit'
  });

  it('should add a new unique tag', () => {
    component.addTag('newtag');
    expect(component.tags.length).toBe(3);
    expect(component.tags.at(2).value).toBe('newtag');
  });

  it('should not add a duplicate tag', () => {
    component.addTag('angular');
    expect(component.tags.length).toBe(2); // still 2, no duplicate
  });

  it('should remove a tag', () => {
    component.removeTag(0);
    expect(component.tags.length).toBe(1);
    expect(component.tags.at(0).value).toBe('unit');
  });

  it('should mark form invalid if required title is missing', () => {
    component.taskForm.controls['title'].setValue('');
    expect(component.taskForm.invalid).toBeTrue();
  });

  it('should mark due date as invalid if in the past', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString().substring(0, 10);
    component.taskForm.controls['dueDate'].setValue(pastDate);
    expect(component.taskForm.controls['dueDate'].errors?.['pastDate']).toBeTrue();
  });

  it('should close dialog with task data on save if form is valid', () => {
    component.save();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(jasmine.objectContaining({
      title: mockTask.title,
      tags: mockTask.tags,
      priority: mockTask.priority,
    }));
  });

  it('should not close dialog on save if form is invalid', () => {
    component.taskForm.controls['title'].setValue('');
    component.save();
    expect(dialogRefSpy.close).not.toHaveBeenCalled();
  });

  it('should close dialog with null on cancel', () => {
    component.cancel();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(null);
  });
});
