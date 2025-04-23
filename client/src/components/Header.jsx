// client/src/components/Header.jsx
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaBars, FaTimes, FaSignOutAlt } from 'react-icons/fa';
import { FiSun } from 'react-icons/fi';
import { RiMoonFill } from 'react-icons/ri';
import { useTheme } from '../hooks/useTheme';
import { useAuth } from '../context/AuthContext';

const Header = ({ toggleMobileMenu, mobileMenuOpen }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();
  const { logout } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  
  // Handle scroll for sticky header with shadow effect
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Get page title based on current route
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/scheduled':
        return 'Scheduled Posts';
      case '/recurring':
        return 'Recurring Posts';
      default:
        if (location.pathname.startsWith('/posts/')) {
          return 'Post Details';
        }
        return 'X Post Manager';
    }
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-30 bg-white dark:bg-twitter-darker border-b border-gray-200 dark:border-twitter-border transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between px-4 py-3">
        <button 
          id="mobile-toggle"
          onClick={toggleMobileMenu}
          className="text-gray-700 dark:text-gray-200 focus:outline-none"
          aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {mobileMenuOpen ? (
            <FaTimes className="h-6 w-6" />
          ) : (
            <FaBars className="h-6 w-6" />
          )}
        </button>
        
        <div className="flex items-center justify-center">
          <h1 className="text-lg font-bold text-twitter-lightText dark:text-twitter-darkText">
            {getPageTitle()}
          </h1>
        </div>
        
        {/* Theme toggle in mobile header */}
        <button 
          onClick={toggleDarkMode}
          className="p-2 text-gray-700 dark:text-gray-200 focus:outline-none"
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {darkMode ? (
            <FiSun className="h-5 w-5 text-yellow-400" />
          ) : (
            <RiMoonFill className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Desktop Header - Only visible on medium screens and up */}
      <div className="hidden md:flex justify-between items-center px-6 py-3 ml-64">
        <h1 className="text-xl font-bold text-twitter-lightText dark:text-twitter-darkText">
          {getPageTitle()}
        </h1>
        
        <div className="flex items-center space-x-3">
          {/* Desktop theme toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-darker text-gray-700 dark:text-gray-200"
            aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {darkMode ? (
              <FiSun className="h-5 w-5 text-yellow-400" />
            ) : (
              <RiMoonFill className="h-5 w-5" />
            )}
          </button>
          
          {/* Logout button */}
          <button
            onClick={handleLogout}
            className="flex items-center space-x-1 py-2 px-3 rounded-full text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          >
            <FaSignOutAlt className="h-4 w-4 mr-1" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;