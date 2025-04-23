// client/src/components/ThreadPostItem.jsx
import React, { useRef } from 'react';
import { FaImage, FaTrashAlt } from 'react-icons/fa';
import { RiDeleteBinLine } from 'react-icons/ri';

const ThreadPostItem = ({ 
  post, 
  index, 
  onTextChange, 
  onRemove, 
  onAddMedia, 
  onRemoveMedia,
  maxLength,
  isVerified
}) => {
  const mediaInputRef = useRef(null);
  
  // Calculate remaining characters
  const remainingChars = maxLength - post.text.length;
  const charCountClass = remainingChars < 20 
    ? 'danger' 
    : remainingChars < 50 
      ? 'warning' 
      : '';
  
  // Handle media upload
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 4 media files
    if (post.media.length + files.length > 4) {
      alert('You can only attach up to 4 media files per post');
      return;
    }
    
    // Process each file
    const newMedia = files.map(file => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      file,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      url: URL.createObjectURL(file)
    }));
    
    onAddMedia(newMedia);
    
    // Reset the input
    if (mediaInputRef.current) {
      mediaInputRef.current.value = '';
    }
  };
  
  return (
    <div className="relative border-l-2 border-twitter-blue pl-4 pb-6 ml-3">
      {/* Thread indicator */}
      <div className="absolute -left-3 top-0 w-6 h-6 rounded-full bg-twitter-blue text-white flex items-center justify-center font-bold text-sm">
        {index}
      </div>
      
      <div className="bg-white dark:bg-twitter-darker rounded-lg border border-gray-200 dark:border-twitter-border p-3">
        {/* Remove button */}
        <div className="flex justify-end mb-2">
          <button
            type="button"
            onClick={onRemove}
            className="text-red-500 hover:text-red-700 transition-colors"
            aria-label="Remove thread post"
          >
            <FaTrashAlt />
          </button>
        </div>
        
        {/* Post text input */}
        <div>
          <textarea
            className="textarea h-20"
            placeholder={`Thread post #${index}...`}
            value={post.text}
            onChange={(e) => onTextChange(e.target.value)}
            maxLength={maxLength}
          />
          <div className={`char-counter text-right ${charCountClass}`}>
            {remainingChars} characters remaining
          </div>
        </div>
        
        {/* Media preview */}
        {post.media.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {post.media.map(item => (
              <div key={item.id} className="relative group">
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt="Media preview" 
                    className="h-24 w-full object-cover rounded-lg border border-gray-300 dark:border-twitter-border"
                  />
                ) : (
                  <video 
                    src={item.url} 
                    className="h-24 w-full object-cover rounded-lg border border-gray-300 dark:border-twitter-border" 
                    controls 
                  />
                )}
                <button
                  type="button"
                  onClick={() => onRemoveMedia(item.id)}
                  className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove media"
                >
                  <RiDeleteBinLine />
                </button>
              </div>
            ))}
          </div>
        )}
        
        {/* Media upload button */}
        <div className="mt-2">
          <input 
            type="file" 
            ref={mediaInputRef}
            onChange={handleMediaUpload} 
            accept="image/*, video/*" 
            multiple 
            className="hidden" 
            id={`media-upload-thread-${post.id}`}
          />
          <button
            type="button"
            onClick={() => mediaInputRef.current.click()}
            disabled={post.media.length >= 4}
            className="flex items-center space-x-1 text-twitter-blue hover:bg-blue-50 dark:hover:bg-twitter-darker p-2 rounded-full transition-colors text-sm"
          >
            <FaImage className="mr-1" />
            <span>Add Media</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ThreadPostItem;