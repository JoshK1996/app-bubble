/**
 * Orders Page Component
 * Displays a list of the user's orders
 */
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { orderService, OrderSummary } from '@services/orderService';

const OrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  
  const [orders, setOrders] = useState<OrderSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showOrderPlaced, setShowOrderPlaced] = useState<boolean>(false);

  // Check for order placed notification
  useEffect(() => {
    if (location.state && 'orderPlaced' in location.state) {
      setShowOrderPlaced(true);
      
      // Clear the state after a delay
      const timer = setTimeout(() => {
        setShowOrderPlaced(false);
        navigate(location.pathname, { replace: true });
      }, 5000);
      
      return () => clearTimeout(timer);
    }
  }, [location, navigate]);

  // Fetch orders when component mounts
  useEffect(() => {
    const fetchOrders = async () => {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
      
      setIsLoading(true);
      try {
        const data = await orderService.getOrders();
        setOrders(data);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch orders:', err);
        setError('Failed to load your orders. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrders();
  }, [isAuthenticated, location.pathname, navigate]);

  // Get status badge class based on order status
  const getStatusBadgeClass = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'processing':
        return 'badge-processing';
      case 'shipped':
        return 'badge-shipped';
      case 'delivered':
        return 'badge-delivered';
      case 'cancelled':
        return 'badge-cancelled';
      default:
        return 'badge-processing';
    }
  };

  // Format date to readable string
  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="orders-page">
      <h1>Your Orders</h1>
      
      {showOrderPlaced && (
        <div className="alert alert-success">
          <p>Your order has been placed successfully!</p>
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger">
          <p>{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="loading-indicator">Loading your orders...</div>
      ) : orders.length === 0 ? (
        <div className="no-orders">
          <p>You haven't placed any orders yet.</p>
          <Link to="/products" className="btn btn-primary">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-item">
              <div className="order-header">
                <div className="order-date">
                  <span className="label">Order Date:</span>
                  <span className="value">{formatDate(order.createdAt)}</span>
                </div>
                <div className="order-id">
                  <span className="label">Order #:</span>
                  <span className="value">{order.id}</span>
                </div>
                <div className="order-status">
                  <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
              
              <div className="order-summary">
                <div className="order-info">
                  <div className="items-count">
                    {order.totalItems} {order.totalItems === 1 ? 'item' : 'items'}
                  </div>
                  <div className="total-price">
                    ${order.totalPrice.toFixed(2)}
                  </div>
                </div>
                
                <div className="order-actions">
                  <Link to={`/orders/${order.id}`} className="btn btn-secondary">
                    View Order Details
                  </Link>
                  {order.status.toLowerCase() === 'processing' && (
                    <button 
                      className="btn btn-outline"
                      onClick={() => orderService.cancelOrder(order.id)}
                    >
                      Cancel Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage; 