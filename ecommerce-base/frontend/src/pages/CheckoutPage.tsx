/**
 * Checkout Page Component
 * Handles the order placement process
 */
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@hooks/useCart';
import { useAuth } from '@hooks/useAuth';
import { orderService } from '@services/orderService';

// Checkout steps enum
enum CheckoutStep {
  SHIPPING = 'shipping',
  PAYMENT = 'payment',
  REVIEW = 'review',
}

// Address form interface
interface AddressForm {
  fullName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

// Initial address state
const initialAddressState: AddressForm = {
  fullName: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
  phone: '',
};

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, totalItems, totalPrice, clearCart } = useCart();
  const { user } = useAuth();
  
  // State variables
  const [currentStep, setCurrentStep] = useState<CheckoutStep>(CheckoutStep.SHIPPING);
  const [shippingAddress, setShippingAddress] = useState<AddressForm>(initialAddressState);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
  };

  // Handle shipping form submission
  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(CheckoutStep.PAYMENT);
  };

  // Handle payment form submission (stub)
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentStep(CheckoutStep.REVIEW);
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real application, this would include payment processing
      await orderService.createOrder({
        shippingAddress,
        items: items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
        })),
      });
      
      // Clear cart and navigate to order confirmation
      clearCart();
      navigate('/orders', { state: { orderPlaced: true } });
    } catch (err) {
      setError('Failed to place your order. Please try again.');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // If cart is empty, redirect to products
  if (totalItems === 0) {
    return (
      <div className="checkout-empty">
        <h1>Your cart is empty</h1>
        <p>Add some products to your cart before checking out.</p>
        <button 
          className="btn btn-primary"
          onClick={() => navigate('/products')}
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      
      {error && <div className="alert alert-danger">{error}</div>}
      
      <div className="checkout-progress">
        <div className={`step ${currentStep === CheckoutStep.SHIPPING ? 'active' : ''} ${currentStep !== CheckoutStep.SHIPPING ? 'completed' : ''}`}>
          1. Shipping
        </div>
        <div className={`step ${currentStep === CheckoutStep.PAYMENT ? 'active' : ''} ${currentStep === CheckoutStep.REVIEW ? 'completed' : ''}`}>
          2. Payment
        </div>
        <div className={`step ${currentStep === CheckoutStep.REVIEW ? 'active' : ''}`}>
          3. Review & Place Order
        </div>
      </div>
      
      <div className="checkout-content">
        {currentStep === CheckoutStep.SHIPPING && (
          <div className="shipping-step">
            <h2>Shipping Information</h2>
            <form onSubmit={handleShippingSubmit}>
              <div className="form-group">
                <label htmlFor="fullName" className="form-label">Full Name</label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="addressLine1" className="form-label">Address Line 1</label>
                <input
                  type="text"
                  id="addressLine1"
                  name="addressLine1"
                  value={shippingAddress.addressLine1}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="addressLine2" className="form-label">Address Line 2 (Optional)</label>
                <input
                  type="text"
                  id="addressLine2"
                  name="addressLine2"
                  value={shippingAddress.addressLine2}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="city" className="form-label">City</label>
                  <input
                    type="text"
                    id="city"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="state" className="form-label">State/Province</label>
                  <input
                    type="text"
                    id="state"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="postalCode" className="form-label">Postal Code</label>
                  <input
                    type="text"
                    id="postalCode"
                    name="postalCode"
                    value={shippingAddress.postalCode}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="country" className="form-label">Country</label>
                  <input
                    type="text"
                    id="country"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="phone" className="form-label">Phone Number</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  className="form-input"
                  required
                />
              </div>
              
              <div className="button-group">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/cart')}
                >
                  Back to Cart
                </button>
                <button type="submit" className="btn btn-primary">
                  Continue to Payment
                </button>
              </div>
            </form>
          </div>
        )}
        
        {currentStep === CheckoutStep.PAYMENT && (
          <div className="payment-step">
            <h2>Payment Method</h2>
            <form onSubmit={handlePaymentSubmit}>
              <div className="payment-message">
                <p className="note">
                  <strong>Note:</strong> Since this is a demonstration app, no actual payment processing is implemented.
                  In a real application, this would include credit card inputs or other payment methods.
                </p>
              </div>
              
              <div className="form-group">
                <label className="form-label payment-option">
                  <input type="radio" name="paymentMethod" value="creditCard" defaultChecked />
                  <span>Credit Card (Demo)</span>
                </label>
              </div>
              
              <div className="button-group">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setCurrentStep(CheckoutStep.SHIPPING)}
                >
                  Back to Shipping
                </button>
                <button type="submit" className="btn btn-primary">
                  Continue to Review
                </button>
              </div>
            </form>
          </div>
        )}
        
        {currentStep === CheckoutStep.REVIEW && (
          <div className="review-step">
            <h2>Review Your Order</h2>
            
            <div className="review-section">
              <h3>Shipping Address</h3>
              <p>
                {shippingAddress.fullName}<br />
                {shippingAddress.addressLine1}<br />
                {shippingAddress.addressLine2 && `${shippingAddress.addressLine2}<br />`}
                {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}<br />
                {shippingAddress.country}<br />
                Phone: {shippingAddress.phone}
              </p>
              <button
                type="button"
                className="btn btn-link"
                onClick={() => setCurrentStep(CheckoutStep.SHIPPING)}
              >
                Edit
              </button>
            </div>
            
            <div className="review-section">
              <h3>Payment Method</h3>
              <p>Credit Card (Demo)</p>
              <button
                type="button"
                className="btn btn-link"
                onClick={() => setCurrentStep(CheckoutStep.PAYMENT)}
              >
                Edit
              </button>
            </div>
            
            <div className="order-items">
              <h3>Order Items ({totalItems})</h3>
              {items.map(item => (
                <div key={item.id} className="order-item">
                  <div className="item-details">
                    <div className="item-image">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} />
                      ) : (
                        <div className="placeholder-image"></div>
                      )}
                    </div>
                    <div>
                      <div className="item-name">{item.name}</div>
                      <div className="item-quantity">Quantity: {item.quantity}</div>
                    </div>
                  </div>
                  <div className="item-price">${(item.price * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
            
            <div className="order-summary">
              <div className="summary-row">
                <span>Subtotal:</span>
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
            </div>
            
            <div className="button-group">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setCurrentStep(CheckoutStep.PAYMENT)}
              >
                Back
              </button>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handlePlaceOrder}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Place Order'}
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="order-summary-sidebar">
        <h3>Order Summary</h3>
        <div className="summary-items">
          {items.map(item => (
            <div key={item.id} className="summary-item">
              <span>{item.name} &times; {item.quantity}</span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
        </div>
        <div className="summary-totals">
          <div className="summary-row">
            <span>Subtotal:</span>
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
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage; 