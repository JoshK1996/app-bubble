import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FaTasks, FaSignOutAlt, FaUserCircle, FaComment } from 'react-icons/fa';

/**
 * Main navigation component for authenticated pages
 */
const Navigation: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="bg-blue-600 text-white shadow-md">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link to="/dashboard" className="text-xl font-bold flex items-center gap-2">
            <FaTasks /> App Bubble
          </Link>
          
          <div className="hidden md:flex space-x-4">
            <Link 
              to="/dashboard" 
              className="px-3 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Dashboard
            </Link>
            <Link
              to="/chat"
              className="px-3 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
            >
              <FaComment /> Chat
            </Link>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          {user && (
            <div className="flex items-center gap-2">
              <FaUserCircle className="text-lg" />
              <span className="hidden sm:inline">{user.name}</span>
            </div>
          )}
          
          <button 
            onClick={handleLogout}
            className="px-3 py-2 rounded hover:bg-blue-700 transition-colors flex items-center gap-1"
          >
            <FaSignOutAlt /> <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation; 