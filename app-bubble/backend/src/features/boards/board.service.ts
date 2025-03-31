/**
 * Board Service
 * 
 * This service handles business logic for board operations including CRUD functionality.
 */

import { PrismaClient } from '@prisma/client';
import { prisma } from '../../config/database';
import { CreateBoardRequest, UpdateBoardRequest, BoardEntity } from './board.types';

/**
 * Create a new board
 * 
 * @param userId - ID of the user creating the board
 * @param data - Board data
 * @returns Created board
 */
export const createBoard = async (userId: string, data: CreateBoardRequest): Promise<BoardEntity> => {
  const board = await prisma.board.create({
    data: {
      title: data.title,
      description: data.description,
      createdById: userId,
      ownerId: userId,
    },
  });

  return board as unknown as BoardEntity;
};

/**
 * Get all boards owned by or accessible to a user
 * 
 * @param userId - ID of the user
 * @returns List of boards
 */
export const getUserBoards = async (userId: string): Promise<BoardEntity[]> => {
  const boards = await prisma.board.findMany({
    where: {
      OR: [
        { createdById: userId },
        { ownerId: userId },
      ],
    },
    orderBy: {
      updatedAt: 'desc',
    },
  });

  return boards as unknown as BoardEntity[];
};

/**
 * Get a board by ID
 * 
 * @param boardId - ID of the board to retrieve
 * @returns Board or null if not found
 */
export const getBoardById = async (boardId: string): Promise<BoardEntity | null> => {
  const board = await prisma.board.findUnique({
    where: { id: boardId },
    include: {
      columns: {
        orderBy: { order: 'asc' },
        include: {
          tasks: {
            orderBy: { order: 'asc' },
            include: {
              assignee: true,
            },
          },
        },
      },
      createdBy: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
        },
      },
    },
  });

  return board as unknown as BoardEntity | null;
};

/**
 * Update a board
 * 
 * @param boardId - ID of the board to update
 * @param data - Updated board data
 * @returns Updated board
 */
export const updateBoard = async (boardId: string, data: UpdateBoardRequest): Promise<BoardEntity> => {
  const board = await prisma.board.update({
    where: { id: boardId },
    data: {
      ...(data.title && { title: data.title }),
      ...(data.description !== undefined && { description: data.description }),
    },
  });

  return board as unknown as BoardEntity;
};

/**
 * Delete a board
 * 
 * @param boardId - ID of the board to delete
 * @returns Deleted board
 */
export const deleteBoard = async (boardId: string): Promise<BoardEntity> => {
  const board = await prisma.board.delete({
    where: { id: boardId },
  });

  return board as unknown as BoardEntity;
};

/**
 * Check if user has access to a board (as owner or creator)
 * 
 * @param boardId - ID of the board to check
 * @param userId - ID of the user
 * @returns True if user has access, false otherwise
 */
export const hasAccessToBoard = async (boardId: string, userId: string): Promise<boolean> => {
  const board = await prisma.board.findFirst({
    where: {
      id: boardId,
      OR: [
        { createdById: userId },
        { ownerId: userId },
      ],
    },
  });

  return !!board;
}; 