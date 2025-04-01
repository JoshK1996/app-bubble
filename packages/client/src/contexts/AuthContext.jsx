import React, { createContext, useState, useEffect, useContext } from 'react';
import { Auth, Hub } from 'aws-amplify';

const AuthContext = createContext(null);

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const checkUser = async () => {
      try {
        const authUser = await Auth.currentAuthenticatedUser();
        if (isMounted) {
          setUser({
            username: authUser.username,
            email: authUser.attributes.email,
            sub: authUser.attributes.sub,
            // Get group information from Cognito token
            groups: authUser.signInUserSession.accessToken.payload['cognito:groups'] || []
          });
        }
      } catch (err) {
        console.log('Not signed in:', err);
        if (isMounted) {
          setUser(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    const hubListener = ({ payload: { event, data } }) => {
      switch (event) {
        case 'signIn':
          checkUser();
          break;
        case 'signOut':
          setUser(null);
          setLoading(false);
          break;
        case 'customOAuthState':
          console.log('customOAuthState', data);
          break;
        default:
          break;
      }
    };

    Hub.listen('auth', hubListener);
    checkUser();

    return () => {
      isMounted = false;
      Hub.remove('auth', hubListener);
    };
  }, []);

  const signIn = async (username, password) => {
    setLoading(true);
    setError(null);
    try {
      await Auth.signIn(username, password);
      // checkUser will update the user state
    } catch (err) {
      setError(err.message || 'Failed to sign in');
      setLoading(false);
      throw err;
    }
  };

  const signOut = async () => {
    try {
      await Auth.signOut();
      setUser(null);
    } catch (err) {
      setError(err.message || 'Failed to sign out');
    }
  };

  const resetPassword = async (username) => {
    try {
      return await Auth.forgotPassword(username);
    } catch (err) {
      setError(err.message || 'Failed to initiate password reset');
      throw err;
    }
  };

  const confirmResetPassword = async (username, code, newPassword) => {
    try {
      return await Auth.forgotPasswordSubmit(username, code, newPassword);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
      throw err;
    }
  };

  const hasRole = (requiredRoles) => {
    if (!user || !user.groups) return false;
    if (user.groups.includes('Admin')) return true; // Admin has access to everything
    if (Array.isArray(requiredRoles)) {
      return requiredRoles.some(role => user.groups.includes(role));
    }
    return user.groups.includes(requiredRoles);
  };

  const value = {
    user,
    loading,
    error,
    signIn,
    signOut,
    resetPassword,
    confirmResetPassword,
    hasRole,
    isAdmin: user?.groups?.includes('Admin') || false,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 