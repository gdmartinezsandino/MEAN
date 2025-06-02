import { Component, Inject, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormArray,
  AbstractControl,
  FormControl,
} from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Task } from '../../shared/models/task.model';

@Component({
  selector: 'app-task-form',
  templateUrl: './task-form.component.html',
  styleUrls: ['./task-form.component.scss'],
  standalone: false,
})
export class TaskFormComponent implements OnInit {
  taskForm!: FormGroup;
  isEdit = false;

  statuses = ['Pending', 'In Progress', 'Completed'];
  priorities = ['Low', 'Medium', 'High'];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<TaskFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { isEdit: boolean; task?: Task }
  ) {
    this.isEdit = data.isEdit;
  }

  ngOnInit() {
    this.taskForm = this.fb.nonNullable.group({
      title: this.fb.nonNullable.control(
        this.data.task?.title || '',
        [Validators.required, Validators.minLength(3)]
      ),
      dueDate: this.fb.nonNullable.control(
        this.data.task ? this.formatDate(this.data.task.dueDate) : '',
        [Validators.required, this.futureDateValidator]
      ),
      status: this.fb.nonNullable.control(this.data.task?.status || 'Pending', Validators.required),
      priority: this.fb.nonNullable.control(this.data.task?.priority || 'Medium', Validators.required),
      tags: this.fb.nonNullable.array<FormControl<string>>([]),
    });

    if (this.data.task?.tags) {
      this.data.task.tags.forEach((tag) => this.addTag(tag));
    }
  }

  get tags(): FormArray<FormControl<string>> {
    return this.taskForm.get('tags') as FormArray<FormControl<string>>;
  }   

  addTag(value = '') {
    // Check uniqueness before adding
    if (value && this.tags.controls.some(c => c.value === value)) {
      return;
    }
  
    const control = this.fb.nonNullable.control(
      value,
      this.uniqueTagValidator.bind(this)
    );
    this.tags.push(control);
  }  

  removeTag(index: number) {
    this.tags.removeAt(index);
  }

  uniqueTagValidator(control: AbstractControl) {
    const tagValue = control.value;
    const tags = this.tags.controls.map(c => c.value);
    const count = tags.filter(t => t === tagValue).length;
    return count > 1 ? { nonUniqueTag: true } : null;
  }

  futureDateValidator(control: AbstractControl) {
    if (!control.value) return null;
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate < today ? { pastDate: true } : null;
  }

  formatDate(date: string | Date): string {
    const d = new Date(date);
    return d.toISOString().substring(0, 10);
  }   

  save() {
    if (this.taskForm.invalid) return;

    const formValue = this.taskForm.value;

    const task: Task = {
      _id: this.data.task?._id || Date.now().toString(), // careful if _id is string
      title: formValue.title,
      dueDate: new Date(formValue.dueDate).toISOString(),
      status: formValue.status,
      priority: formValue.priority,
      tags: this.tags.controls.map(c => c.value.trim()).filter(t => !!t),
      history: this.data.task?.history || [],
    };

    this.dialogRef.close(task);
  }

  cancel() {
    this.dialogRef.close(null);
  }
}
