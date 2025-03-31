/**
 * Board Types Definitions
 * 
 * This module defines TypeScript interfaces and types related to boards.
 * These types are used for API requests, responses, and internal data handling.
 */

import { UserResponse } from '../users/user.types';
import { ColumnResponse } from '../columns/column.types';

/**
 * Request data for creating a new board
 */
export interface CreateBoardRequest {
  title: string;
  description?: string;
}

/**
 * Request data for updating an existing board
 */
export interface UpdateBoardRequest {
  title?: string;
  description?: string;
}

/**
 * Board data returned in API responses
 */
export interface BoardResponse {
  id: string;
  title: string;
  description?: string;
  createdBy: UserResponse;
  owner: UserResponse;
  columns?: ColumnResponse[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Minimal board data for use in lists or summaries
 */
export interface BoardSummaryResponse {
  id: string;
  title: string;
  description?: string;
  columnsCount: number;
  tasksCount: number;
  createdAt: Date;
}

/**
 * Board data stored in the database
 */
export interface BoardEntity {
  id: string;
  title: string;
  description?: string;
  createdById: string;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
} 