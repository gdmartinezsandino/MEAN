import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

interface TaskHistory {
  date: Date;
  changes: string;
}

@Component({
  selector: 'app-task-history',
  templateUrl: './task-history.component.html',
  styleUrls: ['./task-history.component.scss'],
  standalone: false,
})
export class TaskHistoryComponent {
  history: TaskHistory[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { history: TaskHistory[] }) {
    this.history = data.history || [];
  }
}
