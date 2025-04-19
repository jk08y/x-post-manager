// client/src/components/MobileNavBar.jsx
import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaCalendarAlt, FaClock } from 'react-icons/fa';
import { RiTwitterXFill } from 'react-icons/ri';

const MobileNavBar = () => {
  const location = useLocation();
  
  // Define navigation items
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
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-twitter-darker border-t border-gray-200 dark:border-twitter-border z-20 shadow-lg">
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
        
        {/* Post button (centered, larger) */}
        <Link
          to="/"
          className="mobile-nav-item"
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
        >
          <div className="mobile-nav-post-button">
            <RiTwitterXFill className="text-xl" />
          </div>
          <span className="mobile-nav-label text-twitter-blue">Post</span>
        </Link>
      </div>
    </div>
  );
};

export default MobileNavBar;