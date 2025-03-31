/**
 * Column Controller
 * 
 * This controller handles HTTP requests for column operations
 */

import { Request, Response } from 'express';
import * as columnService from './column.service';
import * as boardService from '../boards/board.service';
import { logger } from '../../utils/logger';
import { CreateColumnRequest, ReorderColumnsRequest } from './column.types';

/**
 * Create a new column in a board
 * 
 * @route POST /api/boards/:boardId/columns
 */
export const createColumn = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const boardId = req.params.boardId;
    
    // Check if user has access to the board
    const hasAccess = await boardService.hasAccessToBoard(boardId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this board' });
      return;
    }

    const data: CreateColumnRequest = {
      ...req.body,
      boardId, // Ensure the boardId comes from the URL parameter
    };
    
    const column = await columnService.createColumn(data);
    res.status(201).json(column);
  } catch (error) {
    logger.error('Error creating column:', error);
    res.status(500).json({ message: 'Failed to create column' });
  }
};

/**
 * Get all columns for a board
 * 
 * @route GET /api/boards/:boardId/columns
 */
export const getBoardColumns = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const boardId = req.params.boardId;
    
    // Check if user has access to the board
    const hasAccess = await boardService.hasAccessToBoard(boardId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this board' });
      return;
    }

    const columns = await columnService.getBoardColumns(boardId);
    res.status(200).json(columns);
  } catch (error) {
    logger.error('Error fetching columns:', error);
    res.status(500).json({ message: 'Failed to fetch columns' });
  }
};

/**
 * Get a column by ID
 * 
 * @route GET /api/columns/:id
 */
export const getColumnById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const columnId = req.params.id;
    
    // Check if user has access to the column
    const hasAccess = await columnService.hasAccessToColumn(columnId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this column' });
      return;
    }

    const column = await columnService.getColumnById(columnId);
    if (!column) {
      res.status(404).json({ message: 'Column not found' });
      return;
    }

    res.status(200).json(column);
  } catch (error) {
    logger.error('Error fetching column:', error);
    res.status(500).json({ message: 'Failed to fetch column' });
  }
};

/**
 * Update a column
 * 
 * @route PUT /api/columns/:id
 */
export const updateColumn = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const columnId = req.params.id;
    
    // Check if user has access to the column
    const hasAccess = await columnService.hasAccessToColumn(columnId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this column' });
      return;
    }

    const data = req.body;
    const updatedColumn = await columnService.updateColumn(columnId, data);

    res.status(200).json(updatedColumn);
  } catch (error) {
    logger.error('Error updating column:', error);
    res.status(500).json({ message: 'Failed to update column' });
  }
};

/**
 * Delete a column
 * 
 * @route DELETE /api/columns/:id
 */
export const deleteColumn = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const columnId = req.params.id;
    
    // Check if user has access to the column
    const hasAccess = await columnService.hasAccessToColumn(columnId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this column' });
      return;
    }

    await columnService.deleteColumn(columnId);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting column:', error);
    res.status(500).json({ message: 'Failed to delete column' });
  }
};

/**
 * Reorder columns in a board
 * 
 * @route PUT /api/boards/:boardId/columns/reorder
 */
export const reorderColumns = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const boardId = req.params.boardId;
    
    // Check if user has access to the board
    const hasAccess = await boardService.hasAccessToBoard(boardId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this board' });
      return;
    }

    const data: ReorderColumnsRequest = req.body;
    const updatedColumns = await columnService.reorderColumns(boardId, data);

    res.status(200).json(updatedColumns);
  } catch (error) {
    logger.error('Error reordering columns:', error);
    res.status(500).json({ message: 'Failed to reorder columns' });
  }
}; 