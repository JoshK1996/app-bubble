import api from './api';
import { Task, CreateTaskRequest, ReorderTasksRequest, MoveTaskRequest } from '../types/task';

/**
 * Task service for API calls
 */
const taskService = {
  /**
   * Get all tasks for a column
   */
  getColumnTasks: async (columnId: string): Promise<Task[]> => {
    const response = await api.get(`/columns/${columnId}/tasks`);
    return response.data;
  },

  /**
   * Get a task by ID
   */
  getTaskById: async (taskId: string): Promise<Task> => {
    const response = await api.get(`/tasks/${taskId}`);
    return response.data;
  },

  /**
   * Create a new task
   */
  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post(`/columns/${data.columnId}/tasks`, data);
    return response.data;
  },

  /**
   * Update a task
   */
  updateTask: async (taskId: string, data: Partial<Task>): Promise<Task> => {
    const response = await api.put(`/tasks/${taskId}`, data);
    return response.data;
  },

  /**
   * Delete a task
   */
  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete(`/tasks/${taskId}`);
  },

  /**
   * Reorder tasks within a column
   */
  reorderTasks: async (columnId: string, data: ReorderTasksRequest): Promise<Task[]> => {
    const response = await api.put(`/columns/${columnId}/tasks/reorder`, data);
    return response.data;
  },

  /**
   * Move a task to a different column
   */
  moveTask: async (taskId: string, data: MoveTaskRequest): Promise<Task> => {
    const response = await api.put(`/tasks/${taskId}/move`, data);
    return response.data;
  },
};

export default taskService; 