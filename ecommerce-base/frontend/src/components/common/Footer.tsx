/**
 * Footer Component
 */
import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-links">
            <div className="footer-section">
              <h3>Shop</h3>
              <ul>
                <li><Link to="/products">All Products</Link></li>
                <li><Link to="/products?featured=true">Featured</Link></li>
                <li><Link to="/products?new=true">New Arrivals</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Customer</h3>
              <ul>
                <li><Link to="/cart">Cart</Link></li>
                <li><Link to="/orders">Orders</Link></li>
                <li><Link to="/profile">Profile</Link></li>
              </ul>
            </div>

            <div className="footer-section">
              <h3>Company</h3>
              <ul>
                <li><Link to="/about">About Us</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/terms">Terms & Conditions</Link></li>
              </ul>
            </div>
          </div>

          <div className="copyright">
            <p>&copy; {currentYear} E-Commerce Platform. All rights reserved.</p>
            <p>Built with APP BUBBLE - AI/Human Optimized Framework</p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 