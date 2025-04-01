import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Paper, 
  Container,
  Alert,
  CircularProgress,
  Link
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [forgotPasswordMode, setForgotPasswordMode] = useState(false);
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);

  const { signIn, resetPassword, confirmResetPassword, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username || !password) {
      setLoginError('Username and password are required');
      return;
    }

    setIsProcessing(true);
    setLoginError('');

    try {
      await signIn(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setLoginError(err.message || 'Failed to sign in');
      setIsProcessing(false);
    }
  };

  const handleResetRequest = async (e) => {
    e.preventDefault();
    if (!username) {
      setLoginError('Email/username is required for password reset');
      return;
    }

    setIsProcessing(true);
    setLoginError('');

    try {
      await resetPassword(username);
      setResetSent(true);
      setIsProcessing(false);
    } catch (err) {
      setLoginError(err.message || 'Failed to request password reset');
      setIsProcessing(false);
    }
  };

  const handleResetConfirm = async (e) => {
    e.preventDefault();
    if (!username || !resetCode || !newPassword) {
      setLoginError('All fields are required to reset your password');
      return;
    }

    setIsProcessing(true);
    setLoginError('');

    try {
      await confirmResetPassword(username, resetCode, newPassword);
      setForgotPasswordMode(false);
      setResetSent(false);
      setLoginError('');
      setIsProcessing(false);
    } catch (err) {
      setLoginError(err.message || 'Failed to reset password');
      setIsProcessing(false);
    }
  };

  const renderForgotPassword = () => {
    if (!resetSent) {
      return (
        <Box component="form" onSubmit={handleResetRequest} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Email/Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isProcessing}
          >
            {isProcessing ? <CircularProgress size={24} /> : 'Request Password Reset'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link 
              component="button" 
              variant="body2" 
              onClick={() => setForgotPasswordMode(false)}
            >
              Back to login
            </Link>
          </Box>
        </Box>
      );
    } else {
      return (
        <Box component="form" onSubmit={handleResetConfirm} noValidate sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="resetCode"
            label="Verification Code"
            name="resetCode"
            autoFocus
            value={resetCode}
            onChange={(e) => setResetCode(e.target.value)}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="newPassword"
            label="New Password"
            type="password"
            id="newPassword"
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={isProcessing}
          >
            {isProcessing ? <CircularProgress size={24} /> : 'Reset Password'}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link 
              component="button" 
              variant="body2" 
              onClick={() => {
                setForgotPasswordMode(false);
                setResetSent(false);
              }}
            >
              Back to login
            </Link>
          </Box>
        </Box>
      );
    }
  };

  const renderLogin = () => {
    return (
      <Box component="form" onSubmit={handleLogin} noValidate sx={{ mt: 1 }}>
        <TextField
          margin="normal"
          required
          fullWidth
          id="username"
          label="Username"
          name="username"
          autoComplete="username"
          autoFocus
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <TextField
          margin="normal"
          required
          fullWidth
          name="password"
          label="Password"
          type="password"
          id="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <Button
          type="submit"
          fullWidth
          variant="contained"
          sx={{ mt: 3, mb: 2 }}
          disabled={isProcessing}
        >
          {isProcessing ? <CircularProgress size={24} /> : 'Sign In'}
        </Button>
        <Box sx={{ textAlign: 'center' }}>
          <Link 
            component="button" 
            variant="body2" 
            onClick={() => setForgotPasswordMode(true)}
          >
            Forgot password?
          </Link>
        </Box>
      </Box>
    );
  };

  return (
    <Container component="main" maxWidth="xs">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper 
          elevation={3} 
          sx={{ 
            padding: 4, 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center',
            width: '100%'
          }}
        >
          <Typography component="h1" variant="h5">
            Construction Material Tracker
          </Typography>
          
          {loginError && (
            <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
              {loginError}
            </Alert>
          )}
          
          {forgotPasswordMode ? renderForgotPassword() : renderLogin()}
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage; 