// client/src/components/ThemeToggle.jsx
import { FaSun, FaMoon } from 'react-icons/fa';
import { Switch } from '@headlessui/react';
import { useTheme } from '../hooks/useTheme';

const ThemeToggle = () => {
  const { darkMode, toggleDarkMode } = useTheme();

  return (
    <div className="flex items-center justify-between w-full p-3 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-dark transition-colors">
      <span className="flex items-center">
        {darkMode ? (
          <FaSun className="mr-3 text-xl text-yellow-400" />
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