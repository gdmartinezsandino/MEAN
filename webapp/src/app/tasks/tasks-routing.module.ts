import { NgModule, Component } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TaskListComponent } from './task-list/task-list.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { TaskHistoryComponent } from './task-history/task-history.component';
import { TaskFormComponent } from './task-form/task-form.component';

@Component({
  standalone: true,
  selector: 'app-empty-route',
  template: ''
})
export class EmptyRouteComponent {}

const routes: Routes = [
  {
    path: '',
    component: TaskListComponent,
    children: [
      { path: '', component: EmptyRouteComponent },
      { path: 'new', component: EmptyRouteComponent },
      { path: ':id/edit', component: EmptyRouteComponent },
      { path: ':id/history', component: EmptyRouteComponent }
    ]
  },
  { path: ':id', component: TaskDetailComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TasksRoutingModule {}
