// client/src/pages/Unauthorized.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { RiTwitterXFill, RiShieldKeyholeFill } from 'react-icons/ri';
import { FaLock, FaArrowLeft } from 'react-icons/fa';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';

const Unauthorized = () => {
  const { darkMode } = useTheme();
  const { setAuthError } = useAuth();
  const navigate = useNavigate();
  
  const handleBackToLogin = () => {
    // Clear the auth error and go back to login
    setAuthError(null);
    navigate('/login');
  };
  
  return (
    <div className={`min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-twitter-dark ${darkMode ? 'dark' : ''}`}>
      <div className="max-w-md w-full space-y-8 bg-white dark:bg-twitter-darker p-8 rounded-xl shadow-md text-center">
        <div className="flex flex-col items-center">
          <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full">
            <FaLock className="text-4xl text-red-600 dark:text-red-500" />
          </div>
          
          <h2 className="mt-6 text-3xl font-bold text-twitter-lightText dark:text-twitter-darkText">
            Access Denied
          </h2>
          
          <div className="mt-4 flex items-center justify-center">
            <RiTwitterXFill className="text-twitter-blue text-2xl mr-2" />
            <h3 className="text-xl font-semibold text-twitter-lightText dark:text-twitter-darkText">
              X Post Manager
            </h3>
          </div>
          
          <div className="mt-4 text-gray-600 dark:text-gray-300">
            <p>You are not authorized to access this application.</p>
            <p className="mt-2">This X Post Manager is private and requires specific permissions.</p>
          </div>
          
          <div className="mt-8 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
            <RiShieldKeyholeFill className="mr-1" />
            <span>Only authorized users can access this application</span>
          </div>
          
          <button
            onClick={handleBackToLogin}
            className="mt-8 flex items-center justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-twitter-blue hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-twitter-blue"
          >
            <FaArrowLeft className="mr-2" />
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;