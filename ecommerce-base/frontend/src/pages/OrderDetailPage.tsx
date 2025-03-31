/**
 * Order Detail Page Component
 * Displays detailed information about a specific order
 */
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { orderService, OrderDetail } from '@services/orderService';

const OrderDetailPage: React.FC = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isCancelling, setIsCancelling] = useState<boolean>(false);

  // Fetch order details when component mounts
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: location.pathname } });
        return;
      }
      
      if (!orderId) {
        setError('Order ID is missing');
        setIsLoading(false);
        return;
      }
      
      setIsLoading(true);
      try {
        const data = await orderService.getOrder(orderId);
        setOrder(data);
        setError(null);
      } catch (err) {
        console.error(`Failed to fetch order ${orderId}:`, err);
        setError('Failed to load order details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [isAuthenticated, orderId, navigate]);

  // Handle order cancellation
  const handleCancelOrder = async () => {
    if (!order || !orderId) return;
    
    if (order.status.toLowerCase() !== 'processing') {
      setError('This order cannot be cancelled');
      return;
    }
    
    setIsCancelling(true);
    try {
      const updatedOrder = await orderService.cancelOrder(orderId);
      setOrder(updatedOrder);
      setError(null);
    } catch (err) {
      console.error(`Failed to cancel order ${orderId}:`, err);
      setError('Failed to cancel the order. Please try again later.');
    } finally {
      setIsCancelling(false);
    }
  };

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
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="order-detail-page">
      <div className="back-link">
        <Link to="/orders">&larr; Back to Orders</Link>
      </div>
      
      {error && (
        <div className="alert alert-danger">
          <p>{error}</p>
        </div>
      )}
      
      {isLoading ? (
        <div className="loading-indicator">Loading order details...</div>
      ) : !order ? (
        <div className="no-order">
          <p>Order not found</p>
          <Link to="/orders" className="btn btn-primary">
            View All Orders
          </Link>
        </div>
      ) : (
        <div className="order-detail">
          <div className="order-header">
            <h1>Order #{order.id}</h1>
            <div className="order-meta">
              <div className="order-date">
                <span className="label">Placed on:</span>
                <span className="value">{formatDate(order.createdAt)}</span>
              </div>
              <div className="order-status">
                <span className={`status-badge ${getStatusBadgeClass(order.status)}`}>
                  {order.status}
                </span>
              </div>
            </div>
          </div>
          
          <div className="order-sections">
            <div className="order-items-section">
              <h2>Order Items</h2>
              <div className="order-items">
                {order.items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div className="placeholder-image"></div>
                      )}
                    </div>
                    <div className="item-details">
                      <div className="item-name">{item.name}</div>
                      <div className="item-meta">
                        <span className="item-quantity">Qty: {item.quantity}</span>
                        <span className="item-price">${item.price.toFixed(2)} each</span>
                      </div>
                    </div>
                    <div className="item-total">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="order-info-section">
              <div className="shipping-info">
                <h2>Shipping Information</h2>
                <div className="address-details">
                  <p>{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.addressLine1}</p>
                  {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                  <p>
                    {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                  <p>Phone: {order.shippingAddress.phone}</p>
                </div>
                
                {order.trackingNumber && (
                  <div className="tracking-info">
                    <h3>Tracking Information</h3>
                    <p>Tracking #: {order.trackingNumber}</p>
                    {order.estimatedDelivery && (
                      <p>Estimated Delivery: {formatDate(order.estimatedDelivery)}</p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="payment-info">
                <h2>Payment Information</h2>
                <div className="payment-details">
                  <p>Method: {order.paymentMethod}</p>
                  <p>Status: {order.paymentStatus}</p>
                </div>
              </div>
              
              <div className="order-summary">
                <h2>Order Summary</h2>
                <div className="summary-table">
                  <div className="summary-row">
                    <span>Subtotal:</span>
                    <span>${order.totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="summary-row">
                    <span>Shipping:</span>
                    <span>Free</span>
                  </div>
                  <div className="summary-row total">
                    <span>Total:</span>
                    <span>${order.totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="order-actions">
            {order.status.toLowerCase() === 'processing' && (
              <button 
                className="btn btn-danger"
                onClick={handleCancelOrder}
                disabled={isCancelling}
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Order'}
              </button>
            )}
            <Link to="/products" className="btn btn-primary">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderDetailPage; 