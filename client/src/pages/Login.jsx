// client/src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { FaGoogle, FaEnvelope, FaLock } from 'react-icons/fa';
import { RiTwitterXFill } from 'react-icons/ri';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../hooks/useTheme';

const Login = () => {
  const { darkMode } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const { currentUser, login, loginGoogle, authError, setAuthError } = useAuth();
  
  // Clear any previous auth errors when the component mounts
  useEffect(() => {
    if (authError) {
      setAuthError(null);
    }
  }, []);
  
  // If already logged in, redirect to home
  if (currentUser) {
    return <Navigate to="/" />;
  }
  
  // If unauthorized, redirect to unauthorized page
  if (authError === "unauthorized") {
    return <Navigate to="/unauthorized" />;
  }
  
  // Handle email/password login
  const handleLogin = async (e) => {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/');
    } catch (error) {
      console.error('Login error:', error);
      // Don't set regular errors for unauthorized errors since we redirect
      if (!error.message.includes("Unauthorized")) {
        setError(
          error.code === 'auth/invalid-credential' 
            ? 'Invalid email or password'
            : error.code === 'auth/user-not-found'
              ? 'User not found'
              : error.message || 'Failed to sign in'
        );
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle Google sign in
  const handleGoogleLogin = async () => {
    try {
      setError('');
      setLoading(true);
      await loginGoogle();
      navigate('/');
    } catch (error) {
      console.error('Google login error:', error);
      // Don't set regular errors for unauthorized errors since we redirect
      if (!error.message.includes("Unauthorized")) {
        setError(error.message || 'Failed to sign in with Google');
      }
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-twitter-dark ${darkMode ? 'dark' : ''}`}>
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-twitter-darker p-8 rounded-xl shadow-md">
        <div className="text-center">
          <div className="flex justify-center">
            <RiTwitterXFill className="text-twitter-blue text-4xl" />
          </div>
          <h2 className="mt-4 text-3xl font-bold text-twitter-lightText dark:text-twitter-darkText">
            X Post Manager
          </h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Sign in to your account to continue
          </p>
        </div>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:text-red-100" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}
        
        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-twitter-blue focus:border-twitter-blue focus:z-10 sm:text-sm dark:bg-twitter-dark dark:border-twitter-border dark:text-gray-100"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-3 pl-10 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-twitter-blue focus:border-twitter-blue focus:z-10 sm:text-sm dark:bg-twitter-dark dark:border-twitter-border dark:text-gray-100"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
          </div>
          
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-twitter-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-twitter-blue"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
        
        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-twitter-darker text-gray-500 dark:text-gray-400">
                Or continue with
              </span>
            </div>
          </div>
          
          <div className="mt-6">
            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              type="button"
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 dark:border-twitter-border shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-twitter-darker hover:bg-gray-50 dark:hover:bg-twitter-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-twitter-blue"
            >
              <FaGoogle className="h-5 w-5 text-red-500 mr-2" />
              Sign in with Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;