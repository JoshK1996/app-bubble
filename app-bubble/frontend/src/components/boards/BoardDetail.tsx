import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBoardContext } from '../../contexts/BoardContext';
import { Column, Task } from '../../types/task';
import { formatDate } from '../../utils/dateUtils';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  horizontalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { ColumnComponent } from '../columns/Column';
import { TaskCard } from '../tasks/TaskCard';
import { CreateColumnForm } from '../columns/CreateColumnForm';
import { CreateTaskForm } from '../tasks/CreateTaskForm';
import { EditBoardForm } from './EditBoardForm';

export const BoardDetail: React.FC = () => {
  const { boardId } = useParams<{ boardId: string }>();
  const navigate = useNavigate();
  const {
    currentBoard,
    isLoading,
    error,
    fetchBoardById,
    updateBoard,
    deleteBoard,
    createColumn,
    reorderColumns,
    moveTask,
    reorderTasks,
  } = useBoardContext();

  const [showEditBoard, setShowEditBoard] = useState(false);
  const [showAddColumn, setShowAddColumn] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<'column' | 'task' | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (boardId) {
      fetchBoardById(boardId);
    }
  }, [boardId, fetchBoardById]);

  const handleEditBoard = async (title: string, description: string) => {
    if (!boardId) return;
    await updateBoard(boardId, {
      title,
      description: description.trim() || undefined,
    });
    setShowEditBoard(false);
  };

  const handleDeleteBoard = async () => {
    if (!boardId || !window.confirm('Are you sure you want to delete this board?')) return;
    await deleteBoard(boardId);
    navigate('/boards');
  };

  const handleAddColumn = async (title: string) => {
    if (!boardId) return;
    await createColumn({ title, boardId });
    setShowAddColumn(false);
  };

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Determine if we're dragging a column or a task
    if (active.data.current?.type === 'column') {
      setActiveType('column');
    } else {
      setActiveType('task');
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    
    // Return if no over element or same element
    if (!over || active.id === over.id) return;
    
    // Only handle task-over-column case for dropping tasks into columns
    if (
      activeType === 'task' &&
      over.data.current?.type === 'column' &&
      active.data.current?.columnId !== over.id
    ) {
      // Get task data
      const task = active.data.current as Task;
      const sourceColumnId = task.columnId;
      const destinationColumnId = over.id as string;
      
      if (sourceColumnId !== destinationColumnId) {
        // Update the board state optimistically
        // Note: The actual API call happens in handleDragEnd
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || !currentBoard) {
      setActiveId(null);
      setActiveType(null);
      return;
    }
    
    // Handle column reordering
    if (activeType === 'column') {
      const oldIndex = currentBoard.columns?.findIndex(col => col.id === active.id) ?? -1;
      const newIndex = currentBoard.columns?.findIndex(col => col.id === over.id) ?? -1;
      
      if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
        // Get the new ordering of columns
        const reorderedColumns = [...(currentBoard.columns || [])];
        const movedColumns = arrayMove(reorderedColumns, oldIndex, newIndex);
        const columnIds = movedColumns.map(col => col.id);
        
        // Update in the API
        await reorderColumns(currentBoard.id, columnIds);
      }
    }
    // Handle task reordering or moving
    else if (activeType === 'task') {
      const taskId = active.id as string;
      const task = active.data.current as Task;
      const sourceColumnId = task.columnId;
      const isOverColumn = over.data.current?.type === 'column';
      const targetColumnId = isOverColumn ? over.id as string : over.data.current?.columnId as string;
      
      // If dropped onto a column or onto a task in a different column
      if (sourceColumnId !== targetColumnId) {
        // Move task to a different column (at the end)
        await moveTask(taskId, targetColumnId);
      } 
      // Reordering within the same column
      else {
        const column = currentBoard.columns?.find(col => col.id === sourceColumnId);
        if (!column) {
          setActiveId(null);
          setActiveType(null);
          return;
        }
        
        const taskIds = column.tasks?.map(t => t.id) || [];
        const oldIndex = taskIds.indexOf(taskId);
        
        // If over another task, find its index
        let newIndex = -1;
        if (!isOverColumn) {
          newIndex = taskIds.indexOf(over.id as string);
        } else {
          // If over the column itself, move to the end
          newIndex = taskIds.length - 1;
        }
        
        if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
          // Get the new ordering of tasks
          const reorderedTasks = arrayMove(taskIds, oldIndex, newIndex);
          
          // Update in the API
          await reorderTasks(sourceColumnId, reorderedTasks);
        }
      }
    }
    
    setActiveId(null);
    setActiveType(null);
  };

  if (isLoading && !currentBoard) {
    return <div className="text-center p-4">Loading board...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  if (!currentBoard) {
    return <div className="text-center p-4">Board not found</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b pb-4 mb-4">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">{currentBoard.title}</h1>
            {currentBoard.description && (
              <p className="text-gray-600 mt-1">{currentBoard.description}</p>
            )}
            <p className="text-sm text-gray-500 mt-1">
              Created: {formatDate(currentBoard.createdAt)}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setShowEditBoard(true)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200"
            >
              Edit
            </button>
            <button
              onClick={handleDeleteBoard}
              className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
            >
              Delete
            </button>
          </div>
        </div>

        {showEditBoard && (
          <div className="mt-4">
            <EditBoardForm
              board={currentBoard}
              onCancel={() => setShowEditBoard(false)}
              onSubmit={handleEditBoard}
            />
          </div>
        )}
      </div>

      <div className="overflow-x-auto pb-2 flex-grow">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex h-full space-x-4 px-1 pb-4">
            <SortableContext
              items={currentBoard.columns?.map(column => column.id) || []}
              strategy={horizontalListSortingStrategy}
            >
              {currentBoard.columns?.map(column => (
                <ColumnComponent key={column.id} column={column} />
              ))}
            </SortableContext>

            {showAddColumn ? (
              <div className="min-w-[300px] bg-gray-100 rounded-lg p-3">
                <CreateColumnForm
                  onCancel={() => setShowAddColumn(false)}
                  onSubmit={handleAddColumn}
                />
              </div>
            ) : (
              <button
                onClick={() => setShowAddColumn(true)}
                className="min-w-[300px] h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-50"
              >
                + Add Column
              </button>
            )}
          </div>
        </DndContext>
      </div>
    </div>
  );
}; 