export interface TaskHistory {
  timestamp: Date;
  changes: string;
}

export interface Task {
  _id?: string;
  title: string;
  description?: string;
  status: 'Pending' | 'In Progress' | 'Completed';
  priority: 'Low' | 'Medium' | 'High';
  dueDate: string;
  tags: string[];
  history?: TaskHistory[];
}
