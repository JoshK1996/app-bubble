/**
 * Task Mongoose Schema for MongoDB
 * 
 * This module defines the Task schema and model for MongoDB using Mongoose.
 * It represents individual tasks within columns on a board.
 */

import mongoose, { Schema, Document } from 'mongoose';

/**
 * Interface defining the structure of a Task document in MongoDB
 */
export interface ITask extends Document {
  title: string;
  description?: string;
  order: number; // Position of the task in the column
  columnId: mongoose.Types.ObjectId; // Reference to the Column this task belongs to
  assigneeId?: mongoose.Types.ObjectId; // Optional reference to the User assigned to this task
  deadline?: Date; // Optional deadline for the task
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Mongoose schema for Task model
 * Defines the fields, validation rules, and indexes for the Task collection
 */
const TaskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    order: {
      type: Number,
      required: [true, 'Task order is required'],
      min: [0, 'Task order must be a non-negative number'],
    },
    columnId: {
      type: Schema.Types.ObjectId,
      ref: 'Column',
      required: [true, 'Column ID is required'],
    },
    assigneeId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    deadline: {
      type: Date,
    },
  },
  {
    timestamps: true, // Automatically creates createdAt and updatedAt fields
  },
);

// Create indexes for faster lookups
TaskSchema.index({ columnId: 1, order: 1 }); // For maintaining order within a column
TaskSchema.index({ assigneeId: 1 }); // For querying tasks assigned to a user
TaskSchema.index({ deadline: 1 }); // For querying tasks by deadline

/**
 * Task model for MongoDB using the defined schema
 * This is exported to be used in various services for CRUD operations
 */
export const TaskModel = mongoose.model<ITask>('Task', TaskSchema); 