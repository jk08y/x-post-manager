// client/src/components/PostItem.jsx
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format, formatDistanceToNow } from 'date-fns';
import { FaTrash, FaPaperPlane, FaPencilAlt, FaClock, FaCalendarAlt, FaChevronDown, FaChevronUp, FaImage, FaVideo } from 'react-icons/fa';
import { RiTwitterXFill, RiChat3Line } from 'react-icons/ri';

const API_URL = 'http://localhost:5000';

const PostItem = ({ post, onDelete, onSendNow, onEdit }) => {
  const [expanded, setExpanded] = useState(false);
  
  const isScheduled = post.scheduledTime;
  const isRecurring = post.cronExpression;
  const isThread = post.isThread && post.threadPosts && post.threadPosts.length > 0;
  const hasMedia = post.media && post.media.length > 0;
  
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
  
  // Render media preview
  const renderMedia = (mediaItems) => {
    if (!mediaItems || mediaItems.length === 0) return null;
    
    return (
      <div className={`grid grid-cols-${Math.min(mediaItems.length, 2)} gap-2 mt-2`}>
        {mediaItems.map((item, index) => {
          const isImage = item.mimetype?.startsWith('image/') || item.type === 'image';
          const isVideo = item.mimetype?.startsWith('video/') || item.type === 'video';
          
          // Generate the URL - use the server path if available, or the local object URL
          const mediaUrl = item.path 
            ? `${API_URL}/${item.path.replace(/\\/g, '/')}` 
            : item.url;
          
          return (
            <div key={index} className="relative rounded-lg overflow-hidden border border-gray-300 dark:border-twitter-border">
              {isImage && (
                <div className="relative pb-[56.25%]">
                  <img 
                    src={mediaUrl} 
                    alt={`Media attachment ${index + 1}`}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
              )}
              
              {isVideo && (
                <div className="relative pb-[56.25%]">
                  <video 
                    src={mediaUrl} 
                    className="absolute inset-0 w-full h-full object-cover" 
                    controls
                  />
                </div>
              )}
              
              <div className="absolute top-2 left-2 bg-black bg-opacity-60 text-white p-1 rounded-md text-xs">
                {isImage ? <FaImage className="inline mr-1" /> : <FaVideo className="inline mr-1" />}
                {isImage ? 'Image' : 'Video'}
              </div>
            </div>
          );
        })}
      </div>
    );
  };
  
  return (
    <div className="post-item group">
      <div className="mb-3">
        {/* Main post content */}
        <p className="whitespace-pre-wrap break-words text-twitter-lightText dark:text-twitter-darkText">
          {post.text}
        </p>
        
        {/* Media preview for main post */}
        {hasMedia && renderMedia(post.media)}
        
        {/* Thread indicator */}
        {isThread && (
          <div 
            className="flex items-center mt-3 text-twitter-blue cursor-pointer"
            onClick={() => setExpanded(!expanded)}
          >
            <RiChat3Line className="mr-2" />
            <span className="font-medium">
              {expanded ? 'Hide thread' : `Show thread (${post.threadPosts.length} ${post.threadPosts.length === 1 ? 'reply' : 'replies'})`}
            </span>
            {expanded ? <FaChevronUp className="ml-2" /> : <FaChevronDown className="ml-2" />}
          </div>
        )}
      </div>
      
      {/* Thread posts (if expanded) */}
      {isThread && expanded && (
        <div className="ml-4 pl-4 border-l-2 border-twitter-blue space-y-4 mb-4">
          {post.threadPosts.map((threadPost, index) => (
            <div key={index} className="bg-gray-50 dark:bg-twitter-darker p-3 rounded-lg">
              <p className="whitespace-pre-wrap break-words text-twitter-lightText dark:text-twitter-darkText">
                {threadPost.text}
              </p>
              
              {/* Media preview for thread post */}
              {threadPost.media && threadPost.media.length > 0 && renderMedia(threadPost.media)}
            </div>
          ))}
        </div>
      )}
      
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
        
        {isThread && (
          <div className="flex items-center">
            <RiChat3Line className="mr-1 text-twitter-blue" />
            <span>{post.threadPosts.length} {post.threadPosts.length === 1 ? 'reply' : 'replies'}</span>
          </div>
        )}
        
        {hasMedia && (
          <div className="flex items-center">
            <FaImage className="mr-1 text-twitter-blue" />
            <span>{post.media.length} {post.media.length === 1 ? 'attachment' : 'attachments'}</span>
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