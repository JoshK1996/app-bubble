/**
 * Register Page Component
 * Handles user registration
 */
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@hooks/useAuth';
import { ROUTES } from '@constants/index';

const RegisterPage: React.FC = () => {
  const [username, setUsername] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [formError, setFormError] = useState<string>('');
  
  const { register, error, isLoading, clearError } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    
    // Basic validation
    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      setFormError('Please fill in all fields');
      return;
    }
    
    if (password !== confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }
    
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters long');
      return;
    }
    
    try {
      await register({ username, email, password });
      navigate(ROUTES.HOME);
    } catch (err) {
      // Error is handled by the auth context
      console.error('Registration failed:', err);
    }
  };

  return (
    <div className="register-page">
      <div className="auth-container">
        <h1>Create Account</h1>
        
        {(error || formError) && (
          <div className="alert alert-danger">
            {formError || error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                clearError();
              }}
              className="form-control"
              required
              autoFocus
            />
          </div>
          
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
            <small className="form-text text-muted">
              Password must be at least 6 characters long
            </small>
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => {
                setConfirmPassword(e.target.value);
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
              {isLoading ? 'Creating Account...' : 'Register'}
            </button>
          </div>
        </form>
        
        <div className="auth-footer">
          <p>
            Already have an account?{' '}
            <Link to={ROUTES.LOGIN}>Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 