import api from './api';
import { Column, CreateColumnRequest, ReorderColumnsRequest } from '../types/task';

/**
 * Column service for API calls
 */
const columnService = {
  /**
   * Get all columns for a board
   */
  getBoardColumns: async (boardId: string): Promise<Column[]> => {
    const response = await api.get(`/boards/${boardId}/columns`);
    return response.data;
  },

  /**
   * Get a column by ID
   */
  getColumnById: async (columnId: string): Promise<Column> => {
    const response = await api.get(`/columns/${columnId}`);
    return response.data;
  },

  /**
   * Create a new column
   */
  createColumn: async (data: CreateColumnRequest): Promise<Column> => {
    const response = await api.post(`/boards/${data.boardId}/columns`, data);
    return response.data;
  },

  /**
   * Update a column
   */
  updateColumn: async (
    columnId: string, 
    data: { title?: string; order?: number }
  ): Promise<Column> => {
    const response = await api.put(`/columns/${columnId}`, data);
    return response.data;
  },

  /**
   * Delete a column
   */
  deleteColumn: async (columnId: string): Promise<void> => {
    await api.delete(`/columns/${columnId}`);
  },

  /**
   * Reorder columns in a board
   */
  reorderColumns: async (boardId: string, data: ReorderColumnsRequest): Promise<Column[]> => {
    const response = await api.put(`/boards/${boardId}/columns/reorder`, data);
    return response.data;
  },
};

export default columnService; 