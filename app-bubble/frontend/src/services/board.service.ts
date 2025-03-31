import api from './api';
import { Board, CreateBoardRequest } from '../types/task';

/**
 * Board service for API calls
 */
const boardService = {
  /**
   * Get all boards for the current user
   */
  getBoards: async (): Promise<Board[]> => {
    const response = await api.get('/boards');
    return response.data;
  },

  /**
   * Get a board by ID
   */
  getBoardById: async (boardId: string): Promise<Board> => {
    const response = await api.get(`/boards/${boardId}`);
    return response.data;
  },

  /**
   * Create a new board
   */
  createBoard: async (data: CreateBoardRequest): Promise<Board> => {
    const response = await api.post('/boards', data);
    return response.data;
  },

  /**
   * Update a board
   */
  updateBoard: async (
    boardId: string, 
    data: { title?: string; description?: string | null }
  ): Promise<Board> => {
    const response = await api.put(`/boards/${boardId}`, data);
    return response.data;
  },

  /**
   * Delete a board
   */
  deleteBoard: async (boardId: string): Promise<void> => {
    await api.delete(`/boards/${boardId}`);
  },
};

export default boardService; 