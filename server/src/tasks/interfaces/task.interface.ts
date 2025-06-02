import { Document } from 'mongoose';
import { TaskStatus, TaskPriority } from '../enums/task.enums';

export interface Task extends Document {
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: Date;
  tags?: string[];
  history: {
    changedAt: Date;
    changes: string;
  }[];
}
