/**
 * Column Types Definitions
 * 
 * This module defines TypeScript interfaces and types related to board columns.
 * These types are used for API requests, responses, and internal data handling.
 */

import { TaskResponse } from '../tasks/task.types';

/**
 * Request data for creating a new column
 */
export interface CreateColumnRequest {
  title: string;
  boardId: string;
  order?: number; // If not provided, the column will be added at the end
}

/**
 * Request data for updating an existing column
 */
export interface UpdateColumnRequest {
  title?: string;
  order?: number;
}

/**
 * Column data returned in API responses
 */
export interface ColumnResponse {
  id: string;
  title: string;
  order: number;
  boardId: string;
  tasks?: TaskResponse[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Request data for reordering columns
 */
export interface ReorderColumnsRequest {
  orderedColumnIds: string[]; // Array of column IDs in the desired order
}

/**
 * Column data stored in the database
 */
export interface ColumnEntity {
  id: string;
  title: string;
  order: number;
  boardId: string;
  createdAt: Date;
  updatedAt: Date;
}