/**
 * Header Component
 * Contains the navigation and branding
 */
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';

const Header: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();

  return (
    <header className="app-header">
      <div className="container">
        <div className="header-content">
          <div className="brand">
            <Link to="/">
              <h1>E-Commerce</h1>
            </Link>
          </div>
          
          <nav className="main-nav">
            <ul>
              <li>
                <Link to="/">Home</Link>
              </li>
              <li>
                <Link to="/products">Products</Link>
              </li>
              {isAuthenticated ? (
                <>
                  <li>
                    <Link to="/cart">Cart</Link>
                  </li>
                  <li>
                    <Link to="/orders">Orders</Link>
                  </li>
                  <li>
                    <button onClick={logout} className="btn">Logout</button>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login" className="btn btn-primary">Login</Link>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header; 