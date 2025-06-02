import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, ParamMap, NavigationEnd } from '@angular/router';
import { TaskService } from '../services/tasks.service';
import { Task } from '../../shared/models/task.model';
import { MatDialog } from '@angular/material/dialog';
import { TaskFormComponent } from '../task-form/task-form.component';
import { ConfirmDialogComponent } from '../../shared/confirm-dialog/confirm-dialog.component';
import { TaskHistoryComponent } from '../task-history/task-history.component';
import { filter } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  standalone: false,
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  filteredTasks: Task[] = [];
  paginatedTasks: Task[] = [];

  searchTerm = '';
  filterStatus = '';
  filterPriority = '';
  filterTags: string[] = [];

  statuses = ['Pending', 'In Progress', 'Completed'];
  priorities = ['Low', 'Medium', 'High'];
  allTags: string[] = [];

  sortKey: keyof Pick<Task, 'title' | 'dueDate' | 'priority' | 'status'> = 'dueDate';
  sortOrder: 'asc' | 'desc' = 'asc';

  currentPage = 1;
  pageSize = 5;
  totalPages = 1;

  constructor(
    private taskService: TaskService, 
    private dialog: MatDialog,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit() {
    this.getTasks();

    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        const url = this.router.url;

        if (url.endsWith('/new')) {
          this.handlerAddTask();
        } else {
          const child = this.route.firstChild;
          const id = child?.snapshot.paramMap.get('id');

          if (id && url.includes('edit')) {
            this.handlerEditTask(id);
          } else if (id && url.includes('history')) {
            this.openHistoryDialog(id);
          }
        }
    });
  }

  getTasks() {
    this.taskService.getTasks().subscribe(tasks => {
      this.tasks = tasks;
      this.extractTags();
      this.applyFilters();
    });
  }

  extractTags() {
    const tagSet = new Set<string>();
    this.tasks.forEach(t => t.tags.forEach(tag => tagSet.add(tag)));
    this.allTags = Array.from(tagSet);
  }

  // Filtering setup
  applyFilters() {
    this.filteredTasks = this.tasks.filter(task => {
      const matchesStatus =
        !this.filterStatus || task.status === this.filterStatus;
      const matchesPriority =
        !this.filterPriority || task.priority === this.filterPriority;
      const matchesTags =
        !this.filterTags.length ||
        this.filterTags.every(tag => task.tags.includes(tag));
      const matchesSearch =
        !this.searchTerm ||
        task.title.toLowerCase().includes(this.searchTerm.toLowerCase());

      return matchesStatus && matchesPriority && matchesTags && matchesSearch;
    });
    this.sortTasks();
    this.setupPagination();
  }
  sortBy(key: keyof Pick<Task, 'title' | 'dueDate' | 'priority' | 'status'>) {
    if (this.sortKey === key) {
      this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortKey = key;
      this.sortOrder = 'asc';
    }
    this.sortTasks();
    this.setupPagination();
  }
  sortTasks() {
    this.filteredTasks.sort((a, b) => {
      let valA = a[this.sortKey];
      let valB = b[this.sortKey];
  
      if (this.sortKey === 'dueDate') {
        valA = new Date(valA as string).getTime().toString();
        valB = new Date(valB as string).getTime().toString();
      }
  
      if (valA < valB) return this.sortOrder === 'asc' ? -1 : 1;
      if (valA > valB) return this.sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
  }

  // Add new task setup
  openAddForm() {
    this.router.navigate(['/tasks/new']);
  }
  handlerAddTask() {
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '500px',
      data: { isEdit: false }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      this.router.navigate(['/tasks']);
      if (result) {
        this.taskService.addTask(result).subscribe({
          next: () => {
            this.snackBar.open('Task created successfully', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
            this.getTasks();
          },
          error: () => {
            this.snackBar.open('Failed to create task', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });
      }
    });
  }

  // Edit task setup
  openEditForm(task: Task) {
    this.router.navigate(['/tasks', task._id, 'edit']);
  }
  handlerEditTask(taskId: string) {
    const task = this.tasks.find(t => t._id === taskId);
    if (!task) {
      this.router.navigate(['/tasks']);
      return;
    }
  
    const dialogRef = this.dialog.open(TaskFormComponent, {
      width: '500px',
      data: { isEdit: true, task }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      this.router.navigate(['/tasks']);
      if (result) {
        this.taskService.updateTask(result).subscribe({
          next: () => {
            this.snackBar.open('Task updated successfully', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });
            this.getTasks();
          },
          error: () => {
            this.snackBar.open('Failed to update task', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });
      }
    });
  }
  
  // History view setup
  openHistory(task: Task) {
    this.router.navigate(['/tasks', task._id, 'history']);
  }
  openHistoryDialog(taskId: string) {
    const task = this.tasks.find(t => t._id === taskId);
    if (!task) {
      this.router.navigate(['/tasks']);
      return;
    }
  
    const dialogRef = this.dialog.open(TaskHistoryComponent, {
      width: '400px',
      data: { history: task.history }
    });
  
    dialogRef.afterClosed().subscribe(() => {
      this.router.navigate(['/tasks']);
    });
  }

  // Delete task setup
  handlerDeleteTask(id: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '300px',
      data: { message: 'Are you sure you want to delete this task?' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.taskService.deleteTask(id).subscribe({
          next: () => {
            this.snackBar.open('Task deleted successfully', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-success']
            });

            this.getTasks();
          },
          error: () => {
            this.snackBar.open('Failed to delete task', 'Close', {
              duration: 3000,
              panelClass: ['snackbar-error']
            });
          }
        });
      }
    });
  }

  // Pagination setup
  setupPagination() {
    this.totalPages = Math.ceil(this.filteredTasks.length / this.pageSize);
    this.currentPage = Math.min(this.currentPage, this.totalPages || 1);
    const startIndex = (this.currentPage - 1) * this.pageSize;
    this.paginatedTasks = this.filteredTasks.slice(
      startIndex,
      startIndex + this.pageSize
    );
  }
  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.setupPagination();
    }
  }
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.setupPagination();
    }
  }
}
