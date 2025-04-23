// client/src/components/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { FaCalendarAlt, FaClock, FaHome, FaUser, FaSignOutAlt } from 'react-icons/fa';
import { RiTwitterXFill } from 'react-icons/ri';
import { useTheme } from '../hooks/useTheme.js';
import { useAuth } from '../context/AuthContext.jsx';
import MobileNavBar from './MobileNavBar.jsx';
import Header from './Header.jsx';
import Footer from './Footer.jsx';

const Layout = () => {
  const { darkMode } = useTheme();
  const { currentUser, getUserProfile, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  
  // Get user profile data
  const userProfile = getUserProfile();
  
  // Function to get user initials
  const getUserInitials = () => {
    if (!userProfile) return '';
    
    if (userProfile.displayName) {
      return userProfile.displayName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase();
    }
    
    return userProfile.email.charAt(0).toUpperCase();
  };
  
  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Close mobile menu when clicking outside or when route changes
  useEffect(() => {
    const handleClickOutside = (event) => {
      const sidebar = document.getElementById('mobile-sidebar');
      const toggleButton = document.getElementById('mobile-toggle');
      
      if (mobileMenuOpen && sidebar && !sidebar.contains(event.target) && toggleButton && !toggleButton.contains(event.target)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    // Close menu when URL changes
    const handleRouteChange = () => {
      setMobileMenuOpen(false);
    };
    
    window.addEventListener('popstate', handleRouteChange);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('popstate', handleRouteChange);
    };
  }, [mobileMenuOpen]);

  // Navigation items
  const navItems = [
    { path: '/', icon: <FaHome className="text-xl" />, label: 'Dashboard', exact: true },
    { path: '/scheduled', icon: <FaCalendarAlt className="text-xl" />, label: 'Scheduled Posts' },
    { path: '/recurring', icon: <FaClock className="text-xl" />, label: 'Recurring Posts' },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Header - Fixed at top */}
      <Header toggleMobileMenu={toggleMobileMenu} mobileMenuOpen={mobileMenuOpen} />

      {/* Mobile Menu Overlay */}
      <div 
        className={`md:hidden fixed inset-0 z-20 bg-black bg-opacity-50 transition-opacity duration-300 ${
          mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setMobileMenuOpen(false)}
      />

      {/* Sidebar Navigation - Fixed position */}
      <aside 
        id="mobile-sidebar"
        className={`navbar-fixed bg-white dark:bg-twitter-darker border-r border-gray-200 dark:border-twitter-border
          ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
      >
        <div className="navbar-content">
          {/* Logo */}
          <div className="logo-container border-b border-gray-200 dark:border-twitter-border mb-2">
            <RiTwitterXFill className="logo" />
            <h1 className="logo-text">X Post Manager</h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-grow px-2 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink 
                    to={item.path} 
                    className={({ isActive }) => 
                      `flex items-center px-4 py-3 rounded-full transition-all duration-200
                      ${isActive 
                        ? 'nav-item-active' 
                        : 'hover:bg-gray-100 dark:hover:bg-twitter-dark text-gray-700 dark:text-gray-200'
                      }`
                    }
                    end={item.exact}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="mr-4">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
          
          {/* User Section with profile from Firebase */}
          <div className="px-2 py-4 border-t border-gray-200 dark:border-twitter-border mt-auto">
            <div className="flex items-center p-3 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-dark transition-colors">
              {userProfile?.photoURL ? (
                <img 
                  src={userProfile.photoURL} 
                  alt="Profile" 
                  className="w-10 h-10 rounded-full mr-4"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-twitter-blue text-white flex items-center justify-center font-bold mr-4">
                  {getUserInitials()}
                </div>
              )}
              <div className="flex-grow">
                <p className="font-medium text-twitter-lightText dark:text-twitter-darkText">
                  {userProfile?.displayName || 'X Account'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {userProfile?.email || '@yourusername'}
                </p>
              </div>
            </div>
            
            {/* Logout button */}
            <button
              onClick={handleLogout}
              className="w-full mt-2 flex items-center p-3 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-dark transition-colors text-red-500"
            >
              <FaSignOutAlt className="mr-4" />
              <span className="font-medium">Sign Out</span>
            </button>
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="content-wrapper flex-grow bg-gray-50 dark:bg-twitter-dark min-h-screen pt-16 md:pt-16 pb-20 md:pb-16">
        <div className="container mx-auto p-4 md:p-6 max-w-5xl">
          <Outlet />
        </div>
      </main>
      
      {/* Footer - Only on desktop */}
      <Footer />
      
      {/* Mobile Bottom Navigation - Always visible on mobile */}
      <MobileNavBar />
    </div>
  );
};

export default Layout;