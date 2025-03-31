import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task, TaskPriority } from '../../types/task';
import { useBoardContext } from '../../contexts/BoardContext';
import { EditTaskForm } from './EditTaskForm';

interface TaskCardProps {
  task: Task;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task }) => {
  const [showEdit, setShowEdit] = useState(false);
  const { updateTask, deleteTask } = useBoardContext();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
      columnId: task.columnId,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleEdit = () => {
    setShowEdit(true);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      await deleteTask(task.id);
    }
  };

  const handleUpdateTask = async (updatedTask: Partial<Task>) => {
    await updateTask(task.id, updatedTask);
    setShowEdit(false);
  };

  const renderPriorityBadge = () => {
    if (!task.priority) return null;
    
    let colorClass = '';
    switch (task.priority) {
      case TaskPriority.HIGH:
        colorClass = 'bg-red-100 text-red-800';
        break;
      case TaskPriority.MEDIUM:
        colorClass = 'bg-yellow-100 text-yellow-800';
        break;
      case TaskPriority.LOW:
        colorClass = 'bg-green-100 text-green-800';
        break;
      default:
        colorClass = 'bg-gray-100 text-gray-800';
    }
    
    return (
      <span className={`text-xs px-2 py-1 rounded-full ${colorClass}`}>
        {task.priority}
      </span>
    );
  };

  if (showEdit) {
    return (
      <div className="mb-2">
        <EditTaskForm 
          task={task} 
          onSubmit={handleUpdateTask} 
          onCancel={() => setShowEdit(false)} 
        />
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white p-3 rounded shadow mb-2 cursor-move hover:shadow-md"
      {...attributes}
      {...listeners}
    >
      <div className="flex justify-between">
        <h4 className="font-medium text-gray-900 truncate">{task.title}</h4>
        <div className="flex space-x-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleEdit();
            }}
            className="text-gray-500 hover:text-blue-600"
            aria-label="Edit task"
          >
            ✎
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="text-gray-500 hover:text-red-600"
            aria-label="Delete task"
          >
            ×
          </button>
        </div>
      </div>
      
      {task.description && (
        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{task.description}</p>
      )}
      
      <div className="mt-2 flex justify-between items-center">
        {renderPriorityBadge()}
        
        {task.assignee && (
          <div className="text-xs text-gray-500">
            {task.assignee.name || task.assignee.email}
          </div>
        )}
      </div>
    </div>
  );
}; 