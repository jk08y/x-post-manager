// client/src/components/Layout.jsx
import { useState, useEffect } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import { FaCalendarAlt, FaListAlt, FaClock, FaHome, FaBars, FaTimes, FaUser, FaLightbulb } from 'react-icons/fa';
import { RiTwitterXFill } from 'react-icons/ri';
import { useTheme } from '../hooks/useTheme';
import ThemeToggle from './ThemeToggle';

const Layout = () => {
  const { darkMode } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [hideOnScroll, setHideOnScroll] = useState(false);

  // Handle scroll for mobile - hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setHideOnScroll(true);
      } else {
        setHideOnScroll(false);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // Navigation items
  const navItems = [
    { path: '/', icon: <FaHome className="text-xl" />, label: 'Dashboard', exact: true },
    { path: '/scheduled', icon: <FaCalendarAlt className="text-xl" />, label: 'Scheduled Posts' },
    { path: '/recurring', icon: <FaClock className="text-xl" />, label: 'Recurring Posts' },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'dark' : ''}`}>
      {/* Mobile Header - Fixed on top for mobile */}
      <header className={`md:hidden fixed top-0 left-0 right-0 z-20 bg-white dark:bg-twitter-darker border-b border-gray-200 dark:border-twitter-border transition-transform duration-300 ${hideOnScroll ? '-translate-y-full' : 'translate-y-0'}`}>
        <div className="flex items-center justify-between px-4 py-3">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-gray-700 dark:text-gray-200 focus:outline-none"
          >
            {mobileMenuOpen ? (
              <FaTimes className="h-6 w-6" />
            ) : (
              <FaBars className="h-6 w-6" />
            )}
          </button>
          
          <Link to="/" className="flex items-center">
            <RiTwitterXFill className="text-twitter-blue text-2xl mr-2" />
            <span className="text-lg font-bold text-twitter-lightText dark:text-twitter-darkText">X Post Manager</span>
          </Link>
          
          <div className="w-6 h-6"></div> {/* Empty space for balanced header */}
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div className={`md:hidden fixed inset-0 z-10 bg-black bg-opacity-50 transition-opacity duration-300 ${mobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setMobileMenuOpen(false)}>
      </div>

      {/* Sidebar Navigation - Fixed position */}
      <aside className={`navbar-fixed bg-white dark:bg-twitter-darker border-r border-gray-200 dark:border-twitter-border
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="navbar-content flex flex-col">
          {/* Logo */}
          <div className="logo-container border-b border-gray-200 dark:border-twitter-border mb-2">
            <RiTwitterXFill className="logo" />
            <h1 className="logo-text">X Post Manager</h1>
          </div>
          
          {/* Navigation */}
          <nav className="flex-grow px-2 py-4">
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
          
          {/* User and Settings Section */}
          <div className="mt-auto px-2 py-4 border-t border-gray-200 dark:border-twitter-border">
            <div className="flex items-center p-3 mb-3 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-dark transition-colors">
              <FaUser className="text-twitter-blue text-xl mr-4" />
              <div>
                <p className="font-medium text-twitter-lightText dark:text-twitter-darkText">X Account</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">@yourusername</p>
              </div>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </aside>
      
      {/* Main Content */}
      <main className="content-wrapper flex-grow bg-gray-50 dark:bg-twitter-dark min-h-screen pt-16 md:pt-0">
        <div className="container mx-auto p-4 md:p-6 max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;