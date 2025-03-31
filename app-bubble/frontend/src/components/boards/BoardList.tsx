import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBoardContext } from '../../contexts/BoardContext';
import { Board } from '../../types/task';
import { formatDate } from '../../utils/dateUtils';

interface CreateBoardFormProps {
  onCancel: () => void;
  onSubmit: (title: string, description: string) => Promise<void>;
}

const CreateBoardForm: React.FC<CreateBoardFormProps> = ({ onCancel, onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(title, description);
      setTitle('');
      setDescription('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow rounded-md p-4 mb-4">
      <h3 className="text-lg font-semibold mb-3">Create New Board</h3>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter board title"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        <div className="mb-4">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter board description"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            rows={3}
          />
        </div>
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Board'}
          </button>
        </div>
      </form>
    </div>
  );
};

interface BoardCardProps {
  board: Board;
  onDelete: (id: string) => Promise<void>;
}

const BoardCard: React.FC<BoardCardProps> = ({ board, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this board?')) {
      setIsDeleting(true);
      try {
        await onDelete(board.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Link 
      to={`/boards/${board.id}`}
      className="block bg-white shadow rounded-md p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex justify-between items-start">
        <h3 className="text-lg font-semibold text-gray-900">{board.title}</h3>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="text-red-500 hover:text-red-700 disabled:opacity-50"
          aria-label="Delete board"
        >
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
      {board.description && (
        <p className="mt-2 text-sm text-gray-600 line-clamp-2">{board.description}</p>
      )}
      <p className="mt-3 text-xs text-gray-500">
        Created: {formatDate(board.createdAt)}
      </p>
    </Link>
  );
};

export const BoardList: React.FC = () => {
  const { boards, isLoading, error, createBoard, deleteBoard } = useBoardContext();
  const [showForm, setShowForm] = useState(false);

  const handleCreateBoard = async (title: string, description: string) => {
    await createBoard({ title, description: description || undefined });
    setShowForm(false);
  };

  const handleDeleteBoard = async (id: string) => {
    await deleteBoard(id);
  };

  if (isLoading && boards.length === 0) {
    return <div className="text-center p-4">Loading boards...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 p-4">{error}</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold text-gray-900">Your Boards</h2>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
          >
            Create Board
          </button>
        )}
      </div>

      {showForm && (
        <CreateBoardForm 
          onCancel={() => setShowForm(false)} 
          onSubmit={handleCreateBoard} 
        />
      )}

      {boards.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-md">
          <p className="text-gray-600">You don't have any boards yet.</p>
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mt-2 text-indigo-600 hover:text-indigo-800"
            >
              Create your first board
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {boards.map((board) => (
            <BoardCard key={board.id} board={board} onDelete={handleDeleteBoard} />
          ))}
        </div>
      )}
    </div>
  );
}; 