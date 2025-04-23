// client/src/components/ThemeToggle.jsx
import { FaMoon } from 'react-icons/fa';
import { BsSunFill } from 'react-icons/bs';
import { Switch } from '@headlessui/react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = ({ compact = false }) => {
  const { darkMode, toggleDarkMode } = useTheme();

  // Compact version for header
  if (compact) {
    return (
      <button
        onClick={toggleDarkMode}
        className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-darker text-gray-700 dark:text-gray-200"
        aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        {darkMode ? (
          <BsSunFill className="h-5 w-5 text-yellow-400" />
        ) : (
          <FaMoon className="h-5 w-5 text-gray-600" />
        )}
      </button>
    );
  }

  // Full version for sidebar
  return (
    <div className="flex items-center justify-between w-full p-3 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-dark transition-colors">
      <span className="flex items-center">
        {darkMode ? (
          <BsSunFill className="mr-3 text-xl text-yellow-400" />
        ) : (
          <FaMoon className="mr-3 text-xl text-gray-600" />
        )}
        <span className="font-medium">{darkMode ? 'Light Mode' : 'Dim Mode'}</span>
      </span>
      
      <Switch
        checked={darkMode}
        onChange={toggleDarkMode}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          darkMode ? 'bg-twitter-blue' : 'bg-gray-300'
        }`}
      >
        <span className="sr-only">{darkMode ? 'Switch to light mode' : 'Switch to dark mode'}</span>
        <span
          className={`${
            darkMode ? 'translate-x-6' : 'translate-x-1'
          } inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-in-out`}
        />
      </Switch>
    </div>
  );
};

export default ThemeToggle;