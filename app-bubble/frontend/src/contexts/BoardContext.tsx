import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { Board, Column, Task } from '../types/task';
import boardService from '../services/board.service';
import columnService from '../services/column.service';
import taskService from '../services/task.service';

interface BoardContextProps {
  boards: Board[];
  currentBoard: Board | null;
  isLoading: boolean;
  error: string | null;
  fetchBoards: () => Promise<void>;
  fetchBoardById: (boardId: string) => Promise<void>;
  createBoard: (data: { title: string; description?: string }) => Promise<Board>;
  updateBoard: (boardId: string, data: { title?: string; description?: string }) => Promise<Board>;
  deleteBoard: (boardId: string) => Promise<void>;
  createColumn: (data: { title: string; boardId: string }) => Promise<Column>;
  updateColumn: (columnId: string, data: { title?: string; order?: number }) => Promise<Column>;
  deleteColumn: (columnId: string) => Promise<void>;
  reorderColumns: (boardId: string, orderedColumnIds: string[]) => Promise<Column[]>;
  createTask: (data: { title: string; description?: string; columnId: string }) => Promise<Task>;
  updateTask: (taskId: string, data: Partial<Task>) => Promise<Task>;
  deleteTask: (taskId: string) => Promise<void>;
  moveTask: (taskId: string, targetColumnId: string, position?: number) => Promise<Task>;
  reorderTasks: (columnId: string, orderedTaskIds: string[]) => Promise<Task[]>;
}

const BoardContext = createContext<BoardContextProps | undefined>(undefined);

export const useBoardContext = () => {
  const context = useContext(BoardContext);
  if (!context) {
    throw new Error('useBoardContext must be used within a BoardProvider');
  }
  return context;
};

interface BoardProviderProps {
  children: ReactNode;
}

export const BoardProvider: React.FC<BoardProviderProps> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [boards, setBoards] = useState<Board[]>([]);
  const [currentBoard, setCurrentBoard] = useState<Board | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all boards for the current user
  const fetchBoards = async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const fetchedBoards = await boardService.getBoards();
      setBoards(fetchedBoards);
    } catch (err) {
      setError('Failed to fetch boards');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch a specific board by ID
  const fetchBoardById = async (boardId: string) => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const board = await boardService.getBoardById(boardId);
      setCurrentBoard(board);
    } catch (err) {
      setError('Failed to fetch board');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new board
  const createBoard = async (data: { title: string; description?: string }): Promise<Board> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newBoard = await boardService.createBoard(data);
      setBoards(prevBoards => [...prevBoards, newBoard]);
      return newBoard;
    } catch (err) {
      setError('Failed to create board');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a board
  const updateBoard = async (
    boardId: string, 
    data: { title?: string; description?: string }
  ): Promise<Board> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedBoard = await boardService.updateBoard(boardId, data);
      
      // Update boards list
      setBoards(prevBoards => 
        prevBoards.map(board => board.id === boardId ? updatedBoard : board)
      );
      
      // Update current board if it's the one being edited
      if (currentBoard?.id === boardId) {
        setCurrentBoard(updatedBoard);
      }
      
      return updatedBoard;
    } catch (err) {
      setError('Failed to update board');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a board
  const deleteBoard = async (boardId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await boardService.deleteBoard(boardId);
      
      // Remove from boards list
      setBoards(prevBoards => prevBoards.filter(board => board.id !== boardId));
      
      // Clear current board if it's the one being deleted
      if (currentBoard?.id === boardId) {
        setCurrentBoard(null);
      }
    } catch (err) {
      setError('Failed to delete board');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a column
  const createColumn = async (data: { title: string; boardId: string }): Promise<Column> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newColumn = await columnService.createColumn(data);
      
      // Update current board if it's the one being edited
      if (currentBoard?.id === data.boardId) {
        setCurrentBoard(prevBoard => {
          if (!prevBoard) return null;
          return {
            ...prevBoard,
            columns: [...(prevBoard.columns || []), newColumn]
          };
        });
      }
      
      return newColumn;
    } catch (err) {
      setError('Failed to create column');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a column
  const updateColumn = async (
    columnId: string, 
    data: { title?: string; order?: number }
  ): Promise<Column> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedColumn = await columnService.updateColumn(columnId, data);
      
      // Update current board if it contains the updated column
      if (currentBoard && currentBoard.columns?.some(col => col.id === columnId)) {
        setCurrentBoard(prevBoard => {
          if (!prevBoard) return null;
          return {
            ...prevBoard,
            columns: prevBoard.columns?.map(col => 
              col.id === columnId ? updatedColumn : col
            )
          };
        });
      }
      
      return updatedColumn;
    } catch (err) {
      setError('Failed to update column');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a column
  const deleteColumn = async (columnId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await columnService.deleteColumn(columnId);
      
      // Update current board if it contains the deleted column
      if (currentBoard && currentBoard.columns?.some(col => col.id === columnId)) {
        setCurrentBoard(prevBoard => {
          if (!prevBoard) return null;
          return {
            ...prevBoard,
            columns: prevBoard.columns?.filter(col => col.id !== columnId)
          };
        });
      }
    } catch (err) {
      setError('Failed to delete column');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Reorder columns
  const reorderColumns = async (boardId: string, orderedColumnIds: string[]): Promise<Column[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedColumns = await columnService.reorderColumns(boardId, { orderedColumnIds });
      
      // Update current board if it's the one being reordered
      if (currentBoard?.id === boardId) {
        setCurrentBoard(prevBoard => {
          if (!prevBoard) return null;
          
          // Create a map for O(1) lookups
          const columnMap = new Map(
            prevBoard.columns?.map(col => [col.id, col]) || []
          );
          
          // Reorder based on the new ordering
          const reorderedColumns = orderedColumnIds
            .map(id => columnMap.get(id))
            .filter(col => col !== undefined) as Column[];
          
          return {
            ...prevBoard,
            columns: reorderedColumns
          };
        });
      }
      
      return updatedColumns;
    } catch (err) {
      setError('Failed to reorder columns');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Create a task
  const createTask = async (
    data: { title: string; description?: string; columnId: string }
  ): Promise<Task> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newTask = await taskService.createTask(data);
      
      // Update current board if it contains the column
      if (currentBoard && currentBoard.columns?.some(col => col.id === data.columnId)) {
        setCurrentBoard(prevBoard => {
          if (!prevBoard) return null;
          return {
            ...prevBoard,
            columns: prevBoard.columns?.map(col => {
              if (col.id === data.columnId) {
                return {
                  ...col,
                  tasks: [...(col.tasks || []), newTask]
                };
              }
              return col;
            })
          };
        });
      }
      
      return newTask;
    } catch (err) {
      setError('Failed to create task');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Update a task
  const updateTask = async (taskId: string, data: Partial<Task>): Promise<Task> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedTask = await taskService.updateTask(taskId, data);
      
      // Update current board if it contains the updated task
      if (currentBoard) {
        setCurrentBoard(prevBoard => {
          if (!prevBoard) return null;
          
          return {
            ...prevBoard,
            columns: prevBoard.columns?.map(col => {
              if (col.tasks?.some(task => task.id === taskId)) {
                return {
                  ...col,
                  tasks: col.tasks.map(task => 
                    task.id === taskId ? updatedTask : task
                  )
                };
              }
              return col;
            })
          };
        });
      }
      
      return updatedTask;
    } catch (err) {
      setError('Failed to update task');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Delete a task
  const deleteTask = async (taskId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    try {
      await taskService.deleteTask(taskId);
      
      // Update current board if it contains the deleted task
      if (currentBoard) {
        setCurrentBoard(prevBoard => {
          if (!prevBoard) return null;
          
          return {
            ...prevBoard,
            columns: prevBoard.columns?.map(col => {
              if (col.tasks?.some(task => task.id === taskId)) {
                return {
                  ...col,
                  tasks: col.tasks.filter(task => task.id !== taskId)
                };
              }
              return col;
            })
          };
        });
      }
    } catch (err) {
      setError('Failed to delete task');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Move a task to another column
  const moveTask = async (
    taskId: string, 
    targetColumnId: string, 
    position?: number
  ): Promise<Task> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const moveData = position !== undefined 
        ? { columnId: targetColumnId, order: position }
        : { columnId: targetColumnId };
        
      const updatedTask = await taskService.moveTask(taskId, moveData);
      
      // Update current board if it contains the moved task
      if (currentBoard) {
        setCurrentBoard(prevBoard => {
          if (!prevBoard) return null;
          
          // Find the source column and remove the task
          let sourceColumnId: string | undefined;
          let taskToMove: Task | undefined;
          
          const columnsWithoutTask = prevBoard.columns?.map(col => {
            const foundTask = col.tasks?.find(task => task.id === taskId);
            if (foundTask) {
              sourceColumnId = col.id;
              taskToMove = foundTask;
              return {
                ...col,
                tasks: col.tasks?.filter(task => task.id !== taskId)
              };
            }
            return col;
          });
          
          // Nothing to do if task wasn't found
          if (!taskToMove) return prevBoard;
          
          // Add task to the target column
          return {
            ...prevBoard,
            columns: columnsWithoutTask?.map(col => {
              if (col.id === targetColumnId) {
                return {
                  ...col,
                  tasks: [...(col.tasks || []), updatedTask]
                };
              }
              return col;
            })
          };
        });
      }
      
      return updatedTask;
    } catch (err) {
      setError('Failed to move task');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Reorder tasks within a column
  const reorderTasks = async (columnId: string, orderedTaskIds: string[]): Promise<Task[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedTasks = await taskService.reorderTasks(columnId, { orderedTaskIds });
      
      // Update current board if it contains the reordered column
      if (currentBoard && currentBoard.columns?.some(col => col.id === columnId)) {
        setCurrentBoard(prevBoard => {
          if (!prevBoard) return null;
          
          return {
            ...prevBoard,
            columns: prevBoard.columns?.map(col => {
              if (col.id === columnId) {
                // Create a map for O(1) lookups
                const taskMap = new Map(
                  col.tasks?.map(task => [task.id, task]) || []
                );
                
                // Reorder based on the new ordering
                const reorderedTasks = orderedTaskIds
                  .map(id => taskMap.get(id))
                  .filter(task => task !== undefined) as Task[];
                
                return {
                  ...col,
                  tasks: reorderedTasks
                };
              }
              return col;
            })
          };
        });
      }
      
      return updatedTasks;
    } catch (err) {
      setError('Failed to reorder tasks');
      console.error(err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch boards on initial load and when authentication status changes
  useEffect(() => {
    if (isAuthenticated) {
      fetchBoards();
    } else {
      setBoards([]);
      setCurrentBoard(null);
    }
  }, [isAuthenticated]);

  const value = {
    boards,
    currentBoard,
    isLoading,
    error,
    fetchBoards,
    fetchBoardById,
    createBoard,
    updateBoard,
    deleteBoard,
    createColumn,
    updateColumn,
    deleteColumn,
    reorderColumns,
    createTask,
    updateTask,
    deleteTask,
    moveTask,
    reorderTasks
  };

  return (
    <BoardContext.Provider value={value}>
      {children}
    </BoardContext.Provider>
  );
}; 