/**
 * Column Service
 * 
 * This service handles business logic for column operations including CRUD and reordering.
 */

import { prisma } from '../../config/database';
import { CreateColumnRequest, UpdateColumnRequest, ColumnEntity, ReorderColumnsRequest } from './column.types';
import { hasAccessToBoard } from '../boards/board.service';
import { Column, PrismaClient } from '@prisma/client';

/**
 * Create a new column in a board
 * 
 * @param boardId - ID of the board the column belongs to
 * @param data - Column data
 * @returns Created column
 */
export const createColumn = async (data: CreateColumnRequest): Promise<ColumnEntity> => {
  // Get the highest order value to add the new column at the end
  let order = data.order;
  
  if (order === undefined) {
    const highestOrderColumn = await prisma.column.findFirst({
      where: { boardId: data.boardId },
      orderBy: { order: 'desc' },
    });
    
    order = highestOrderColumn ? highestOrderColumn.order + 1 : 0;
  } else {
    // If order is specified, shift existing columns
    await prisma.column.updateMany({
      where: {
        boardId: data.boardId,
        order: {
          gte: order,
        },
      },
      data: {
        order: {
          increment: 1,
        },
      },
    });
  }

  const column = await prisma.column.create({
    data: {
      title: data.title,
      order,
      boardId: data.boardId,
    },
  });

  return column as unknown as ColumnEntity;
};

/**
 * Get all columns for a board
 * 
 * @param boardId - ID of the board
 * @returns List of columns
 */
export const getBoardColumns = async (boardId: string): Promise<ColumnEntity[]> => {
  const columns = await prisma.column.findMany({
    where: { boardId },
    orderBy: { order: 'asc' },
    include: {
      tasks: {
        orderBy: { order: 'asc' },
        include: {
          assignee: true,
        },
      },
    },
  });

  return columns as unknown as ColumnEntity[];
};

/**
 * Get a column by ID
 * 
 * @param columnId - ID of the column to retrieve
 * @returns Column or null if not found
 */
export const getColumnById = async (columnId: string): Promise<ColumnEntity | null> => {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    include: {
      tasks: {
        orderBy: { order: 'asc' },
        include: {
          assignee: true,
        },
      },
    },
  });

  return column as unknown as ColumnEntity | null;
};

/**
 * Update a column
 * 
 * @param columnId - ID of the column to update
 * @param data - Updated column data
 * @returns Updated column
 */
export const updateColumn = async (columnId: string, data: UpdateColumnRequest): Promise<ColumnEntity> => {
  // If order is changed, handle reordering
  let updateData: any = {
    ...(data.title && { title: data.title }),
  };
  
  const column = await prisma.column.findUnique({ where: { id: columnId } });
  if (!column) {
    throw new Error('Column not found');
  }
  
  // Handle order change
  if (data.order !== undefined && data.order !== column.order) {
    // Get the current board ID
    const boardId = column.boardId;
    
    // Handle reordering
    if (data.order > column.order) {
      // Moving down: decrement columns between old and new position
      await prisma.column.updateMany({
        where: {
          boardId,
          order: {
            gt: column.order,
            lte: data.order,
          },
        },
        data: {
          order: {
            decrement: 1,
          },
        },
      });
    } else {
      // Moving up: increment columns between new and old position
      await prisma.column.updateMany({
        where: {
          boardId,
          order: {
            gte: data.order,
            lt: column.order,
          },
        },
        data: {
          order: {
            increment: 1,
          },
        },
      });
    }
    
    updateData.order = data.order;
  }

  const updatedColumn = await prisma.column.update({
    where: { id: columnId },
    data: updateData,
  });

  return updatedColumn as unknown as ColumnEntity;
};

/**
 * Delete a column
 * 
 * @param columnId - ID of the column to delete
 * @returns Deleted column
 */
export const deleteColumn = async (columnId: string): Promise<ColumnEntity> => {
  const column = await prisma.column.findUnique({ where: { id: columnId } });
  if (!column) {
    throw new Error('Column not found');
  }
  
  // Delete the column
  const deletedColumn = await prisma.column.delete({
    where: { id: columnId },
  });
  
  // Reorder remaining columns
  await prisma.column.updateMany({
    where: {
      boardId: column.boardId,
      order: {
        gt: column.order,
      },
    },
    data: {
      order: {
        decrement: 1,
      },
    },
  });

  return deletedColumn as unknown as ColumnEntity;
};

/**
 * Reorder columns in a board
 * 
 * @param boardId - ID of the board containing the columns
 * @param data - Column ordering data
 * @returns List of updated columns
 */
export const reorderColumns = async (boardId: string, data: ReorderColumnsRequest): Promise<ColumnEntity[]> => {
  // Start a transaction to ensure all updates are atomic
  return await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => {
    // Get all columns in the board to validate the IDs in the request
    const existingColumns = await tx.column.findMany({
      where: { boardId },
      select: { id: true },
    });
    
    const existingIds = existingColumns.map((col: { id: string }) => col.id);
    
    // Check if all provided IDs exist in the board
    const allIdsExist = data.orderedColumnIds.every(id => existingIds.includes(id));
    if (!allIdsExist) {
      throw new Error('One or more column IDs do not exist in this board');
    }
    
    // Check if all existing columns are included in the request
    if (existingIds.length !== data.orderedColumnIds.length) {
      throw new Error('Not all columns from the board are included in the reordering request');
    }
    
    // Update the order of each column
    const updates = data.orderedColumnIds.map((id, index) => 
      tx.column.update({
        where: { id },
        data: { order: index },
      })
    );
    
    // Execute all updates
    const results = await Promise.all(updates);
    
    return results as unknown as ColumnEntity[];
  });
};

/**
 * Check if user has access to a column through board ownership
 * 
 * @param columnId - ID of the column to check
 * @param userId - ID of the user
 * @returns True if user has access, false otherwise
 */
export const hasAccessToColumn = async (columnId: string, userId: string): Promise<boolean> => {
  const column = await prisma.column.findUnique({
    where: { id: columnId },
    select: { boardId: true },
  });
  
  if (!column) return false;
  
  // Check if user has access to the column's board
  return hasAccessToBoard(column.boardId, userId);
}; 