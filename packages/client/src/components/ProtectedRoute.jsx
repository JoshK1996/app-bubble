import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { CircularProgress, Box, Typography } from '@mui/material';

const ProtectedRoute = ({ children, requiredRoles = [] }) => {
  const { isAuthenticated, hasRole, loading, user } = useAuth();
  const location = useLocation();
  
  // Show loading spinner while auth state is being determined
  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Verifying authentication...
        </Typography>
      </Box>
    );
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If role check is required and user doesn't have role, redirect to dashboard
  if (requiredRoles.length > 0 && !hasRole(requiredRoles)) {
    return (
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          p: 3,
          textAlign: 'center',
        }}
      >
        <Typography variant="h5" color="error" gutterBottom>
          Access Denied
        </Typography>
        <Typography variant="body1">
          You don't have permission to access this area.
        </Typography>
        <Typography variant="body2" sx={{ mt: 2 }}>
          Current role(s): {user?.groups?.join(', ') || 'None'}
        </Typography>
        <Typography variant="body2" sx={{ mt: 1 }}>
          Required role(s): {Array.isArray(requiredRoles) ? requiredRoles.join(', ') : requiredRoles}
        </Typography>
      </Box>
    );
  }
  
  // If authenticated and has required roles, render the children
  return children;
};

export default ProtectedRoute; 