import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { TaskListComponent } from './task-list/task-list.component';
import { TaskFormComponent } from './task-form/task-form.component';
import { TaskHistoryComponent } from './task-history/task-history.component';
import { TaskDetailComponent } from './task-detail/task-detail.component';
import { TasksRoutingModule } from './tasks-routing.module';
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [
    TaskListComponent,
    TaskFormComponent,
    TaskHistoryComponent,
    TaskDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    TasksRoutingModule,
    SharedModule,
  ],
})
export class TasksModule {}
