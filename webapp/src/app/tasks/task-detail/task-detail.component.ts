import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskService } from '../services/tasks.service';
import { Task } from '../models/task.model';

@Component({
  selector: 'app-task-detail',
  templateUrl: './task-detail.component.html',
  styleUrls: ['./task-detail.component.scss'],
  standalone: false,
})
export class TaskDetailComponent implements OnInit {
  task?: Task;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private taskService: TaskService
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.taskService.getTasks().subscribe(tasks => {
      this.task = tasks.find(t => t._id === id);
      if (!this.task) {
        // Redirect if no task found
        this.router.navigate(['/tasks']);
      }
    });
  }

  goBack() {
    this.router.navigate(['/tasks']);
  }
}
