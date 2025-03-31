import { User } from './user';

/**
 * Board entity
 */
export interface Board {
  id: string;
  title: string;
  description?: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  columns?: Column[];
  owner?: User;
}

/**
 * Column entity
 */
export interface Column {
  id: string;
  title: string;
  order: number;
  boardId: string;
  createdAt: string;
  updatedAt: string;
  tasks?: Task[];
}

/**
 * Task entity
 */
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  priority?: string | null;
  status?: string | null;
  dueDate?: string | null;
  order: number;
  columnId: string;
  assigneeId?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  assignee?: User | null;
}

/**
 * Task priority levels
 */
export enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
}

/**
 * Task status options
 */
export enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  DONE = 'done',
}

/**
 * Task creation request
 */
export interface CreateTaskRequest {
  title: string;
  description?: string;
  priority?: string;
  status?: string;
  dueDate?: string;
  columnId: string;
  assigneeId?: string;
}

/**
 * Column creation request
 */
export interface CreateColumnRequest {
  title: string;
  boardId: string;
}

/**
 * Board creation request
 */
export interface CreateBoardRequest {
  title: string;
  description?: string;
}

/**
 * Data for reordering tasks
 */
export interface ReorderTasksRequest {
  orderedTaskIds: string[];
}

/**
 * Data for reordering columns
 */
export interface ReorderColumnsRequest {
  orderedColumnIds: string[];
}

/**
 * Data for moving a task
 */
export interface MoveTaskRequest {
  columnId: string;
  order?: number;
} 