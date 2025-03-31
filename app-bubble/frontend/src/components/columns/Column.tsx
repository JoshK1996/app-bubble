import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Column, Task } from '../../types/task';
import { useBoardContext } from '../../contexts/BoardContext';
import { TaskCard } from '../tasks/TaskCard';
import { CreateTaskForm } from '../tasks/CreateTaskForm';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

interface ColumnProps {
  column: Column;
}

export const ColumnComponent: React.FC<ColumnProps> = ({ column }) => {
  const [showEditTitle, setShowEditTitle] = useState(false);
  const [title, setTitle] = useState(column.title);
  const [showAddTask, setShowAddTask] = useState(false);
  
  const { updateColumn, deleteColumn, createTask } = useBoardContext();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleDeleteColumn = async () => {
    if (window.confirm('Are you sure you want to delete this column and all its tasks?')) {
      await deleteColumn(column.id);
    }
  };

  const handleUpdateTitle = async () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle && trimmedTitle !== column.title) {
      await updateColumn(column.id, { title: trimmedTitle });
    }
    setShowEditTitle(false);
  };

  const handleAddTask = async (title: string, description: string) => {
    await createTask({
      title,
      description: description || undefined,
      columnId: column.id,
    });
    setShowAddTask(false);
  };

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className="min-w-[300px] bg-gray-100 rounded-lg p-3 flex flex-col h-full"
    >
      <div className="flex justify-between items-center mb-3">
        {showEditTitle ? (
          <div className="flex w-full">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-grow px-2 py-1 border border-gray-300 rounded"
              autoFocus
              onBlur={handleUpdateTitle}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleUpdateTitle();
                if (e.key === 'Escape') {
                  setTitle(column.title);
                  setShowEditTitle(false);
                }
              }}
            />
          </div>
        ) : (
          <div 
            className="flex items-center cursor-move font-semibold text-gray-800"
            {...attributes}
            {...listeners}
          >
            <h3 
              className="truncate"
              onClick={() => setShowEditTitle(true)}
            >
              {column.title}
            </h3>
            <span className="ml-2 text-gray-500 text-sm">
              {column.tasks?.length || 0}
            </span>
          </div>
        )}
        <button
          onClick={handleDeleteColumn}
          className="text-gray-500 hover:text-red-600"
          aria-label="Delete column"
        >
          ×
        </button>
      </div>

      <div className="flex-grow overflow-y-auto mb-3">
        <SortableContext
          items={column.tasks?.map(task => task.id) || []}
          strategy={verticalListSortingStrategy}
        >
          {column.tasks?.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </SortableContext>
        
        {!column.tasks?.length && (
          <div className="text-gray-500 text-center text-sm p-4">
            No tasks yet
          </div>
        )}
      </div>

      {showAddTask ? (
        <CreateTaskForm
          onCancel={() => setShowAddTask(false)}
          onSubmit={handleAddTask}
        />
      ) : (
        <button
          onClick={() => setShowAddTask(true)}
          className="w-full py-2 border border-dashed border-gray-300 rounded text-gray-500 hover:bg-gray-200"
        >
          + Add Task
        </button>
      )}
    </div>
  );
}; 