// client/src/components/MobileNavBar.jsx
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaClock } from 'react-icons/fa';

const MobileNavBar = () => {
  const location = useLocation();
  
  // Define navigation items - just the essential 3 items
  const navItems = [
    { path: '/', icon: <FaHome />, label: 'Home', exact: true },
    { path: '/scheduled', icon: <FaCalendarAlt />, label: 'Scheduled' },
    { path: '/recurring', icon: <FaClock />, label: 'Recurring' },
  ];

  // Check if a path is active
  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  return (
    // Added "fixed" class to ensure it always stays at the bottom
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-twitter-darker border-t border-gray-200 dark:border-twitter-border z-40 shadow-lg">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`mobile-nav-item ${isActive(item.path, item.exact) ? 'active' : ''}`}
          >
            <div className="mobile-nav-icon">{item.icon}</div>
            <span className="mobile-nav-label">{item.label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default MobileNavBar;