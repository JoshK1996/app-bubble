/**
 * Task Controller
 * 
 * This controller handles HTTP requests for task operations
 */

import { Request, Response } from 'express';
import * as taskService from './task.service';
import * as columnService from '../columns/column.service';
import { logger } from '../../utils/logger';
import { CreateTaskRequest, ReorderTasksRequest, MoveTaskRequest } from './task.types';

/**
 * Create a new task in a column
 * 
 * @route POST /api/columns/:columnId/tasks
 */
export const createTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const columnId = req.params.columnId;
    
    // Check if user has access to the column
    const hasAccess = await columnService.hasAccessToColumn(columnId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this column' });
      return;
    }

    const data: CreateTaskRequest = {
      ...req.body,
      columnId, // Ensure the columnId comes from the URL parameter
    };
    
    const task = await taskService.createTask(userId, data);
    res.status(201).json(task);
  } catch (error) {
    logger.error('Error creating task:', error);
    res.status(500).json({ message: 'Failed to create task' });
  }
};

/**
 * Get all tasks for a column
 * 
 * @route GET /api/columns/:columnId/tasks
 */
export const getColumnTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const columnId = req.params.columnId;
    
    // Check if user has access to the column
    const hasAccess = await columnService.hasAccessToColumn(columnId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this column' });
      return;
    }

    const tasks = await taskService.getColumnTasks(columnId);
    res.status(200).json(tasks);
  } catch (error) {
    logger.error('Error fetching tasks:', error);
    res.status(500).json({ message: 'Failed to fetch tasks' });
  }
};

/**
 * Get a task by ID
 * 
 * @route GET /api/tasks/:id
 */
export const getTaskById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const taskId = req.params.id;
    
    // Check if user has access to the task
    const hasAccess = await taskService.hasAccessToTask(taskId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this task' });
      return;
    }

    const task = await taskService.getTaskById(taskId);
    if (!task) {
      res.status(404).json({ message: 'Task not found' });
      return;
    }

    res.status(200).json(task);
  } catch (error) {
    logger.error('Error fetching task:', error);
    res.status(500).json({ message: 'Failed to fetch task' });
  }
};

/**
 * Update a task
 * 
 * @route PUT /api/tasks/:id
 */
export const updateTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const taskId = req.params.id;
    
    // Check if user has access to the task
    const hasAccess = await taskService.hasAccessToTask(taskId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this task' });
      return;
    }

    const data = req.body;
    const updatedTask = await taskService.updateTask(taskId, data);

    res.status(200).json(updatedTask);
  } catch (error) {
    logger.error('Error updating task:', error);
    res.status(500).json({ message: 'Failed to update task' });
  }
};

/**
 * Delete a task
 * 
 * @route DELETE /api/tasks/:id
 */
export const deleteTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const taskId = req.params.id;
    
    // Check if user has access to the task
    const hasAccess = await taskService.hasAccessToTask(taskId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this task' });
      return;
    }

    await taskService.deleteTask(taskId);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting task:', error);
    res.status(500).json({ message: 'Failed to delete task' });
  }
};

/**
 * Reorder tasks within a column
 * 
 * @route PUT /api/columns/:columnId/tasks/reorder
 */
export const reorderTasks = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const columnId = req.params.columnId;
    
    // Check if user has access to the column
    const hasAccess = await columnService.hasAccessToColumn(columnId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this column' });
      return;
    }

    const data: ReorderTasksRequest = req.body;
    const updatedTasks = await taskService.reorderTasks(columnId, data);

    res.status(200).json(updatedTasks);
  } catch (error) {
    logger.error('Error reordering tasks:', error);
    res.status(500).json({ message: 'Failed to reorder tasks' });
  }
};

/**
 * Move a task to a different column
 * 
 * @route PUT /api/tasks/:id/move
 */
export const moveTask = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const taskId = req.params.id;
    
    // Check if user has access to the task
    const hasAccess = await taskService.hasAccessToTask(taskId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this task' });
      return;
    }
    
    // Also check if user has access to the target column
    const data: MoveTaskRequest = req.body;
    const hasColumnAccess = await columnService.hasAccessToColumn(data.columnId, userId);
    if (!hasColumnAccess) {
      res.status(403).json({ message: 'Access denied to the target column' });
      return;
    }

    const updatedTask = await taskService.moveTaskToColumn(taskId, data);
    res.status(200).json(updatedTask);
  } catch (error) {
    logger.error('Error moving task:', error);
    res.status(500).json({ message: 'Failed to move task' });
  }
}; 