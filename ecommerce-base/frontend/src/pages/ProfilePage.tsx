/**
 * Profile Page Component
 * Displays and manages user profile information
 */
import React, { useState } from 'react';
import { useAuth } from '@hooks/useAuth';
import { Link } from 'react-router-dom';
import { ROUTES } from '@constants/index';
import { orderService } from '@services/orderService';

const ProfilePage: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [orderStats, setOrderStats] = useState<{
    totalOrders: number;
    totalSpent: number;
    ordersByStatus: Record<string, number>;
  } | null>(null);
  
  // Load order stats when component mounts
  React.useEffect(() => {
    const fetchOrderStats = async () => {
      if (!user) return;
      
      setIsLoading(true);
      try {
        const stats = await orderService.getOrderStats();
        setOrderStats(stats);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch order stats:', err);
        setError('Could not load your order statistics. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderStats();
  }, [user]);

  // Loading state
  if (authLoading) {
    return <div className="loading">Loading profile...</div>;
  }

  // No user should not happen (protected route), but just in case
  if (!user) {
    return <div className="error">User not found</div>;
  }

  return (
    <div className="profile-page">
      <h1>Your Profile</h1>
      
      <div className="profile-container">
        <div className="profile-section user-info">
          <h2>Account Information</h2>
          <div className="info-item">
            <span className="label">Username:</span>
            <span className="value">{user.username || 'N/A'}</span>
          </div>
          <div className="info-item">
            <span className="label">Email:</span>
            <span className="value">{user.email}</span>
          </div>
          <div className="info-item">
            <span className="label">Role:</span>
            <span className="value">{user.role}</span>
          </div>
          {/* Additional fields like name, address, etc. could be added here */}
        </div>
        
        <div className="profile-section order-summary">
          <h2>Order Summary</h2>
          
          {error && <div className="alert alert-danger">{error}</div>}
          
          {isLoading ? (
            <div className="loading">Loading order statistics...</div>
          ) : orderStats ? (
            <div className="stats-container">
              <div className="stat-item">
                <span className="stat-label">Total Orders:</span>
                <span className="stat-value">{orderStats.totalOrders}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Spent:</span>
                <span className="stat-value">${orderStats.totalSpent.toFixed(2)}</span>
              </div>
              
              <h3>Orders by Status</h3>
              <div className="status-stats">
                {Object.entries(orderStats.ordersByStatus).map(([status, count]) => (
                  <div key={status} className="status-item">
                    <span className="status-label">{status}:</span>
                    <span className="status-value">{count}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p>No order statistics available.</p>
          )}
          
          <div className="profile-actions">
            <Link to={ROUTES.ORDERS} className="btn btn-primary">
              View Order History
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage; 