// client/src/components/PostItem.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { FaTrash, FaPaperPlane, FaPencilAlt, FaClock, FaCalendarAlt } from 'react-icons/fa';

const PostItem = ({ post, onDelete, onSendNow, onEdit }) => {
  const isScheduled = post.scheduledTime;
  const isRecurring = post.cronExpression;
  
  // Format the scheduled date/time
  const formattedDate = isScheduled 
    ? format(new Date(post.scheduledTime), 'MMM d, yyyy h:mm a')
    : null;
  
  // Calculate time until scheduled post
  const timeUntil = isScheduled 
    ? formatDistanceToNow(new Date(post.scheduledTime), { addSuffix: true })
    : null;
  
  // Handle delete with confirmation
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      onDelete(post.id);
    }
  };
  
  return (
    <div className="post-item group">
      <div className="mb-3">
        <p className="whitespace-pre-wrap break-words text-twitter-lightText dark:text-twitter-darkText">
          {post.text}
        </p>
      </div>
      
      <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
        {isScheduled && (
          <>
            <div className="flex items-center">
              <FaCalendarAlt className="mr-1 text-twitter-blue" />
              <span>{formattedDate}</span>
            </div>
            
            <div className="flex items-center">
              <FaClock className="mr-1 text-twitter-blue" />
              <span>{timeUntil}</span>
            </div>
          </>
        )}
        
        {isRecurring && (
          <div className="flex items-center font-medium text-twitter-blue">
            <FaClock className="mr-1" />
            <span>Recurring: {post.cronDescription}</span>
          </div>
        )}
      </div>
      
      <div className="mt-3 flex flex-wrap gap-2 opacity-80 group-hover:opacity-100 transition-opacity duration-200">
        {onSendNow && (
          <button
            onClick={() => onSendNow(post.id)}
            className="flex items-center text-sm py-1.5 px-3 rounded-full bg-twitter-blue text-white hover:bg-blue-600 transition-colors shadow-sm"
          >
            <FaPaperPlane className="mr-1.5" />
            <span>Send Now</span>
          </button>
        )}
        
        {onEdit && (
          <Link
            to={`/posts/${post.id}`}
            className="flex items-center text-sm py-1.5 px-3 rounded-full border border-gray-300 dark:border-twitter-border hover:bg-gray-100 dark:hover:bg-twitter-darker transition-colors"
          >
            <FaPencilAlt className="mr-1.5" />
            <span>Edit</span>
          </Link>
        )}
        
        <button
          onClick={handleDelete}
          className="flex items-center text-sm py-1.5 px-3 rounded-full border border-gray-300 dark:border-twitter-border hover:bg-gray-100 dark:hover:bg-twitter-darker transition-colors text-red-500"
          aria-label="Delete post"
        >
          <FaTrash className="mr-1.5" />
          <span>Delete</span>
        </button>
      </div>
    </div>
  );
};

export default PostItem;