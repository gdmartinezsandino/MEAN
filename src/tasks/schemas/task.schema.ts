import { Schema } from 'mongoose';

export const TaskSchema = new Schema({
  title: { type: String, required: true, minlength: 3 },
  description: { type: String, maxlength: 500 },
  status: { type: String, required: true, enum: ['Pending', 'In Progress', 'Completed'] },
  priority: { type: String, enum: ['Low', 'Medium', 'High'], default: 'Medium' },
  dueDate: { type: Date, required: true },
  tags: { type: [String], validate: [(val: any) => new Set(val).size === val.length, 'Tags must be unique'] },
  history: [{
    changedAt: { type: Date, default: Date.now },
    changes: String
  }]
});

TaskSchema.index({ dueDate: 1 });
TaskSchema.index({ status: 1 });