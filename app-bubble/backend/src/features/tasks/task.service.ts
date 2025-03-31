/**
 * Task Service
 * 
 * This service handles business logic for task operations including CRUD, reordering and moving.
 */

import { prisma } from '../../config/database';
import { CreateTaskRequest, UpdateTaskRequest, TaskEntity, ReorderTasksRequest, MoveTaskRequest } from './task.types';
import { hasAccessToColumn } from '../columns/column.service';
import { PrismaClient } from '@prisma/client';

/**
 * Create a new task in a column
 * 
 * @param userId - ID of the user creating the task
 * @param data - Task data
 * @returns Created task
 */
export const createTask = async (userId: string, data: CreateTaskRequest): Promise<TaskEntity> => {
  // Get the highest order value to add the new task at the end if order is not specified
  let order = data.order;
  
  if (order === undefined) {
    const highestOrderTask = await prisma.task.findFirst({
      where: { columnId: data.columnId },
      orderBy: { order: 'desc' },
    });
    
    order = highestOrderTask ? highestOrderTask.order + 1 : 0;
  } else {
    // If order is specified, shift existing tasks
    await prisma.task.updateMany({
      where: {
        columnId: data.columnId,
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

  const task = await prisma.task.create({
    data: {
      title: data.title,
      description: data.description || null,
      priority: data.priority || null,
      status: data.status || null,
      dueDate: data.dueDate || null,
      order,
      columnId: data.columnId,
      assigneeId: data.assigneeId || null,
      createdBy: userId,
    },
    include: {
      assignee: true,
    },
  });

  return task as unknown as TaskEntity;
};

/**
 * Get all tasks for a column
 * 
 * @param columnId - ID of the column
 * @returns List of tasks
 */
export const getColumnTasks = async (columnId: string): Promise<TaskEntity[]> => {
  const tasks = await prisma.task.findMany({
    where: { columnId },
    orderBy: { order: 'asc' },
    include: {
      assignee: true,
    },
  });

  return tasks as unknown as TaskEntity[];
};

/**
 * Get a task by ID
 * 
 * @param taskId - ID of the task to retrieve
 * @returns Task or null if not found
 */
export const getTaskById = async (taskId: string): Promise<TaskEntity | null> => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: true,
    },
  });

  return task as unknown as TaskEntity | null;
};

/**
 * Update a task
 * 
 * @param taskId - ID of the task to update
 * @param data - Updated task data
 * @returns Updated task
 */
export const updateTask = async (taskId: string, data: UpdateTaskRequest): Promise<TaskEntity> => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new Error('Task not found');
  }
  
  let updateData: any = {
    ...(data.title !== undefined && { title: data.title }),
    ...(data.description !== undefined && { description: data.description }),
    ...(data.priority !== undefined && { priority: data.priority }),
    ...(data.status !== undefined && { status: data.status }),
    ...(data.dueDate !== undefined && { dueDate: data.dueDate }),
    ...(data.assigneeId !== undefined && { assigneeId: data.assigneeId }),
  };
  
  // Handle order change within the same column
  if (data.order !== undefined && data.columnId === undefined && data.order !== task.order) {
    // Handle reordering in the same column
    if (data.order > task.order) {
      // Moving down
      await prisma.task.updateMany({
        where: {
          columnId: task.columnId,
          order: {
            gt: task.order,
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
      // Moving up
      await prisma.task.updateMany({
        where: {
          columnId: task.columnId,
          order: {
            gte: data.order,
            lt: task.order,
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
  
  // If columnId is changing, handle moving between columns
  if (data.columnId !== undefined && data.columnId !== task.columnId) {
    // Move to a different column
    return await moveTaskToColumn(taskId, {
      columnId: data.columnId,
      order: data.order,
    });
  }

  const updatedTask = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: {
      assignee: true,
    },
  });

  return updatedTask as unknown as TaskEntity;
};

/**
 * Delete a task
 * 
 * @param taskId - ID of the task to delete
 * @returns Deleted task
 */
export const deleteTask = async (taskId: string): Promise<TaskEntity> => {
  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    throw new Error('Task not found');
  }
  
  // Delete the task
  const deletedTask = await prisma.task.delete({
    where: { id: taskId },
    include: {
      assignee: true,
    },
  });
  
  // Reorder remaining tasks
  await prisma.task.updateMany({
    where: {
      columnId: task.columnId,
      order: {
        gt: task.order,
      },
    },
    data: {
      order: {
        decrement: 1,
      },
    },
  });

  return deletedTask as unknown as TaskEntity;
};

/**
 * Reorder tasks within a column
 * 
 * @param columnId - ID of the column containing the tasks
 * @param data - Task ordering data
 * @returns List of updated tasks
 */
export const reorderTasks = async (columnId: string, data: ReorderTasksRequest): Promise<TaskEntity[]> => {
  // Start a transaction to ensure all updates are atomic
  return await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => {
    // Get all tasks in the column to validate the IDs in the request
    const existingTasks = await tx.task.findMany({
      where: { columnId },
      select: { id: true },
    });
    
    const existingIds = existingTasks.map((task: { id: string }) => task.id);
    
    // Check if all provided IDs exist in the column
    const allIdsExist = data.orderedTaskIds.every(id => existingIds.includes(id));
    if (!allIdsExist) {
      throw new Error('One or more task IDs do not exist in this column');
    }
    
    // Update the order of each task
    const updates = data.orderedTaskIds.map((id, index) => 
      tx.task.update({
        where: { id },
        data: { order: index },
        include: { assignee: true },
      })
    );
    
    // Execute all updates
    const results = await Promise.all(updates);
    
    return results as unknown as TaskEntity[];
  });
};

/**
 * Move a task to a different column
 * 
 * @param taskId - ID of the task to move
 * @param data - Move request data with target column and optional order
 * @returns Updated task
 */
export const moveTaskToColumn = async (taskId: string, data: MoveTaskRequest): Promise<TaskEntity> => {
  // Start a transaction to ensure all updates are atomic
  return await prisma.$transaction(async (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use'>) => {
    const task = await tx.task.findUnique({ where: { id: taskId } });
    if (!task) {
      throw new Error('Task not found');
    }
    
    // If moving to the same column, use updateTask instead
    if (task.columnId === data.columnId) {
      throw new Error('Task is already in this column. Use updateTask to change order within the same column.');
    }
    
    // Decrement order of tasks in the source column that have higher order
    await tx.task.updateMany({
      where: {
        columnId: task.columnId,
        order: {
          gt: task.order,
        },
      },
      data: {
        order: {
          decrement: 1,
        },
      },
    });
    
    // Determine the order in the target column
    let targetOrder = data.order;
    if (targetOrder === undefined) {
      const highestOrderTask = await tx.task.findFirst({
        where: { columnId: data.columnId },
        orderBy: { order: 'desc' },
      });
      
      targetOrder = highestOrderTask ? highestOrderTask.order + 1 : 0;
    } else {
      // Increment order of tasks in the target column that have equal or higher order
      await tx.task.updateMany({
        where: {
          columnId: data.columnId,
          order: {
            gte: targetOrder,
          },
        },
        data: {
          order: {
            increment: 1,
          },
        },
      });
    }
    
    // Update the task with new column and order
    const updatedTask = await tx.task.update({
      where: { id: taskId },
      data: {
        columnId: data.columnId,
        order: targetOrder,
      },
      include: {
        assignee: true,
      },
    });
    
    return updatedTask as unknown as TaskEntity;
  });
};

/**
 * Check if user has access to a task through column ownership
 * 
 * @param taskId - ID of the task to check
 * @param userId - ID of the user
 * @returns True if user has access, false otherwise
 */
export const hasAccessToTask = async (taskId: string, userId: string): Promise<boolean> => {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { columnId: true },
  });
  
  if (!task) return false;
  
  // Check if user has access to the task's column
  return hasAccessToColumn(task.columnId, userId);
}; 