/**
 * Cart Page Component
 * Displays the current shopping cart and allows modification
 */
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '@hooks/useCart';
import { useAuth } from '@hooks/useAuth';

const CartPage: React.FC = () => {
  const { items, totalItems, totalPrice, isLoading, error, updateQuantity, removeFromCart } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Function to handle quantity changes
  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity >= 1) {
      updateQuantity(itemId, newQuantity);
    }
  };

  // Function to handle proceeding to checkout
  const handleCheckout = () => {
    if (isAuthenticated) {
      navigate('/checkout');
    } else {
      navigate('/login', { state: { redirectTo: '/checkout' } });
    }
  };

  return (
    <div className="cart-page">
      <h1>Your Shopping Cart</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      {isLoading ? (
        <div className="loading">Loading your cart...</div>
      ) : totalItems === 0 ? (
        <div className="empty-cart">
          <p>Your cart is empty.</p>
          <Link to="/products" className="btn btn-primary">
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="cart-content">
          <div className="cart-items">
            <div className="cart-header">
              <div className="col-product">Product</div>
              <div className="col-price">Price</div>
              <div className="col-quantity">Quantity</div>
              <div className="col-total">Total</div>
              <div className="col-remove"></div>
            </div>
            
            {items.map(item => (
              <div key={item.id} className="cart-item">
                <div className="col-product">
                  <div className="product-image">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} />
                    ) : (
                      <div className="placeholder-image"></div>
                    )}
                  </div>
                  <div className="product-details">
                    <Link to={`/products/${item.productId}`} className="product-name">
                      {item.name}
                    </Link>
                  </div>
                </div>
                
                <div className="col-price">${item.price.toFixed(2)}</div>
                
                <div className="col-quantity">
                  <div className="quantity-controls">
                    <button
                      className="quantity-btn decrement"
                      onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    
                    <span className="quantity">{item.quantity}</span>
                    
                    <button
                      className="quantity-btn increment"
                      onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                </div>
                
                <div className="col-total">
                  ${(item.price * item.quantity).toFixed(2)}
                </div>
                
                <div className="col-remove">
                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.id)}
                    aria-label="Remove item"
                  >
                    &times;
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="cart-summary">
            <h3>Order Summary</h3>
            
            <div className="summary-row">
              <span>Subtotal ({totalItems} items):</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            
            <div className="summary-row">
              <span>Shipping:</span>
              <span>Free</span>
            </div>
            
            <div className="summary-row total">
              <span>Total:</span>
              <span>${totalPrice.toFixed(2)}</span>
            </div>
            
            <button 
              className="btn btn-primary checkout-btn"
              onClick={handleCheckout}
              disabled={totalItems === 0}
            >
              Proceed to Checkout
            </button>
            
            <Link to="/products" className="continue-shopping">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage; 