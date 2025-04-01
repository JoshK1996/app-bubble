import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { CircularProgress, Box } from '@mui/material';

// Authentication Provider
import { AuthProvider } from './contexts/AuthContext';

// Layout component
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Page components
import DashboardPage from './pages/DashboardPage';
import ScanPage from './pages/ScanPage';
import MaterialsListPage from './pages/MaterialsListPage';
import MaterialDetailPage from './pages/MaterialDetailPage';
import ImportPage from './pages/ImportPage';
import AdminPage from './pages/AdminPage';
import LoginPage from './pages/LoginPage';
import JobsListPage from './pages/JobsListPage';
import JobDetailPage from './pages/JobDetailPage';

// Loading component for Suspense fallback
const LoadingFallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <AuthProvider>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public route for login */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }>
            <Route index element={<DashboardPage />} />
            <Route path="jobs" element={<JobsListPage />} />
            <Route path="jobs/:jobId" element={<JobDetailPage />} />
            <Route path="materials" element={<MaterialsListPage />} />
            <Route path="materials/:materialId" element={<MaterialDetailPage />} />
            <Route path="scan" element={<ScanPage />} />
            <Route path="import" element={
              <ProtectedRoute requiredRoles={['Admin', 'Estimator']}>
                <ImportPage />
              </ProtectedRoute>
            } />
            <Route path="admin" element={
              <ProtectedRoute requiredRoles={['Admin']}>
                <AdminPage />
              </ProtectedRoute>
            } />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </AuthProvider>
  );
}

export default App; 