/**
 * Board Controller
 * 
 * This controller handles HTTP requests for board operations
 */

import { Request, Response } from 'express';
import { CreateBoardRequest } from './board.types';
import * as boardService from './board.service';
import { logger } from '../../utils/logger';

/**
 * Create a new board
 * 
 * @route POST /api/boards
 */
export const createBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const data: CreateBoardRequest = req.body;
    const board = await boardService.createBoard(userId, data);

    res.status(201).json(board);
  } catch (error) {
    logger.error('Error creating board:', error);
    res.status(500).json({ message: 'Failed to create board' });
  }
};

/**
 * Get all boards for the current user
 * 
 * @route GET /api/boards
 */
export const getUserBoards = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const boards = await boardService.getUserBoards(userId);
    res.status(200).json(boards);
  } catch (error) {
    logger.error('Error fetching user boards:', error);
    res.status(500).json({ message: 'Failed to fetch boards' });
  }
};

/**
 * Get a board by ID
 * 
 * @route GET /api/boards/:id
 */
export const getBoardById = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const boardId = req.params.id;
    
    // Check if user has access to the board
    const hasAccess = await boardService.hasAccessToBoard(boardId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this board' });
      return;
    }

    const board = await boardService.getBoardById(boardId);
    if (!board) {
      res.status(404).json({ message: 'Board not found' });
      return;
    }

    res.status(200).json(board);
  } catch (error) {
    logger.error('Error fetching board:', error);
    res.status(500).json({ message: 'Failed to fetch board' });
  }
};

/**
 * Update a board
 * 
 * @route PUT /api/boards/:id
 */
export const updateBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const boardId = req.params.id;
    
    // Check if user has access to the board
    const hasAccess = await boardService.hasAccessToBoard(boardId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this board' });
      return;
    }

    const data = req.body;
    const updatedBoard = await boardService.updateBoard(boardId, data);

    res.status(200).json(updatedBoard);
  } catch (error) {
    logger.error('Error updating board:', error);
    res.status(500).json({ message: 'Failed to update board' });
  }
};

/**
 * Delete a board
 * 
 * @route DELETE /api/boards/:id
 */
export const deleteBoard = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const boardId = req.params.id;
    
    // Check if user has access to the board
    const hasAccess = await boardService.hasAccessToBoard(boardId, userId);
    if (!hasAccess) {
      res.status(403).json({ message: 'Access denied to this board' });
      return;
    }

    await boardService.deleteBoard(boardId);
    res.status(204).send();
  } catch (error) {
    logger.error('Error deleting board:', error);
    res.status(500).json({ message: 'Failed to delete board' });
  }
}; 