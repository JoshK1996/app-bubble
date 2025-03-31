/**
 * Task Types Definitions
 * 
 * This module defines TypeScript interfaces and types related to tasks.
 * These types are used for API requests, responses, and internal data handling.
 */

import { UserResponse } from '../users/user.types';
import { User } from '@prisma/client';

/**
 * Request data for creating a new task
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: Date;
  columnId: string;
  assigneeId?: string;
  order?: number;
}

/**
 * Request data for updating an existing task
 */
export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: Date | null;
  columnId?: string;
  assigneeId?: string | null;
  order?: number;
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
  orderedTaskIds: string[];
}

/**
 * Task data stored in the database
 */
export interface TaskEntity {
  id: string;
  title: string;
  description: string | null;
  priority: string | null;
  status: string | null;
  dueDate: Date | null;
  order: number;
  columnId: string;
  assigneeId: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  assignee?: User | null;
}

/**
 * Request to move a task to a different column
 */
export interface MoveTaskRequest {
  columnId: string;
  order?: number;
} 