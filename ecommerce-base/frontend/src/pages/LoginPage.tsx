/**
 * Login Page Component
 * Handles user authentication
 */
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants/index';

interface LocationState {
  from?: string;
  redirectTo?: string;
}

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  const { login, error, isLoading, clearError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  
  const state = location.state as LocationState;
  const redirectPath = state?.redirectTo || state?.from || ROUTES.HOME;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Basic validation
    if (!email.trim() || !password) {
      setFormError('Please enter both email and password');
      return;
    }
    
    try {
      await login(email, password);
      navigate(redirectPath);
    } catch (err) {
      // Error is handled by the auth context
      console.error('Login failed:', err);
    }
  };

  return (
    <div className="login-page">
      <div className="auth-container">
        <h1>Login</h1>
        
        {(error || formError) && (
          <div className="alert alert-danger">
            {formError || error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                clearError();
              }}
              className="form-control"
              required
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              className="form-control"
              required
            />
          </div>
          
          <div className="form-actions">
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading}
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </div>
        </form>
        
        <div className="auth-footer">
          <p>
            Don't have an account?{' '}
            <Link to={ROUTES.REGISTER}>Register</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 