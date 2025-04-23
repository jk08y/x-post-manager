// client/src/components/Footer.jsx
import { Link } from 'react-router-dom';
import { RiTwitterXFill } from 'react-icons/ri';
import { FaGithub, FaHeart } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="hidden md:block bg-white dark:bg-twitter-darker border-t border-gray-200 dark:border-twitter-border py-4 px-6 ml-64">
      <div className="container mx-auto max-w-5xl">
        <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <div className="flex items-center mb-2 md:mb-0">
            <RiTwitterXFill className="text-twitter-blue mr-2" />
            <span>X Post Manager © {currentYear}</span>
          </div>
          
          <div className="flex space-x-6">

            <a 
              href="https://github.com/jk08y/x-post-manager" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hover:text-twitter-blue transition-colors flex items-center"
            >
              <FaGithub className="mr-1" />
              <span>GitHub</span>
            </a>
          </div>
          
          <div className="flex items-center mt-2 md:mt-0">
            <span>Made with</span>
            <FaHeart className="mx-1 text-red-500" />
            <span>by jk08y</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;