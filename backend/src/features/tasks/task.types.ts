/**
 * Task Types Definitions
 * 
 * This module defines TypeScript interfaces and types related to tasks.
 * These types are used for API requests, responses, and internal data handling.
 */

import { UserResponse } from '../users/user.types';

/**
 * Request data for creating a new task
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  columnId: string;
  order?: number; // If not provided, the task will be added at the end
  assigneeId?: string;
  deadline?: Date;
}

/**
 * Request data for updating an existing task
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  columnId?: string;
  order?: number;
  assigneeId?: string | null; // null to remove assignee
  deadline?: Date | null; // null to remove deadline
}

/**
 * Task data returned in API responses
 */
export interface TaskResponse {
  id: string;
  title: string;
  description?: string;
  order: number;
  columnId: string;
  assignee?: UserResponse;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request data for reordering tasks within or across columns
 */
export interface ReorderTasksRequest {
  taskId: string;
  targetColumnId: string;
  newOrder: number;
}

/**
 * Task data stored in the database
 */
export interface TaskEntity {
  id: string;
  title: string;
  description?: string;
  order: number;
  columnId: string;
  assigneeId?: string;
  deadline?: Date;
  createdAt: Date;
  updatedAt: Date;
} 