// client/src/components/CreatePost.jsx
import React, { useState, useRef } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { FaCalendarAlt, FaRegClock, FaClock, FaPlus, FaMinus, FaImage, FaVideo, FaPoll, FaGlobe, FaUserCheck } from 'react-icons/fa';
import { RiTwitterXFill, RiDeleteBinLine } from 'react-icons/ri';
import ThreadPostItem from './ThreadPostItem';

// Default character limits
const DEFAULT_CHAR_LIMIT = 280;
const VERIFIED_CHAR_LIMIT = 4000; // For verified users

const CreatePost = ({ onSubmit }) => {
  // User verification status (in a real app, this would come from authentication)
  const [isVerified, setIsVerified] = useState(false);
  
  // Main post state
  const [text, setText] = useState('');
  const [scheduled, setScheduled] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [cronExpression, setCronExpression] = useState('0 12 * * *'); // Default: 12:00 PM daily
  const [cronDescription, setCronDescription] = useState('Every day at 12:00 PM');
  
  // Thread state
  const [isThread, setIsThread] = useState(false);
  const [threadPosts, setThreadPosts] = useState([]);
  
  // Media state
  const [media, setMedia] = useState([]);
  const mediaInputRef = useRef(null);
  
  // Calculate character limit based on verification status
  const MAX_LENGTH = isVerified ? VERIFIED_CHAR_LIMIT : DEFAULT_CHAR_LIMIT;
  
  // Calculate remaining characters
  const remainingChars = MAX_LENGTH - text.length;
  const charCountClass = remainingChars < 20 
    ? 'danger' 
    : remainingChars < 50 
      ? 'warning' 
      : '';
  
  // Handle media upload
  const handleMediaUpload = (e) => {
    const files = Array.from(e.target.files);
    
    // Limit to 4 media files
    if (media.length + files.length > 4) {
      alert('You can only attach up to 4 media files');
      return;
    }
    
    // Process each file
    const newMedia = files.map(file => ({
      id: Date.now() + Math.random().toString(36).substr(2, 9),
      file,
      type: file.type.startsWith('image/') ? 'image' : 'video',
      url: URL.createObjectURL(file)
    }));
    
    setMedia([...media, ...newMedia]);
    
    // Reset the input
    if (mediaInputRef.current) {
      mediaInputRef.current.value = '';
    }
  };
  
  // Remove media
  const removeMedia = (id) => {
    setMedia(media.filter(item => item.id !== id));
  };
  
  // Add thread post
  const addThreadPost = () => {
    if (threadPosts.length < 10) { // Limit to 10 posts in a thread
      setThreadPosts([
        ...threadPosts, 
        { 
          id: Date.now(), 
          text: '',
          media: []
        }
      ]);
    }
  };
  
  // Remove thread post
  const removeThreadPost = (id) => {
    setThreadPosts(threadPosts.filter(post => post.id !== id));
  };
  
  // Update thread post text
  const updateThreadPostText = (id, newText) => {
    setThreadPosts(threadPosts.map(post => 
      post.id === id ? { ...post, text: newText } : post
    ));
  };
  
  // Add media to thread post
  const addMediaToThreadPost = (postId, newMedia) => {
    setThreadPosts(threadPosts.map(post => 
      post.id === postId 
        ? { ...post, media: [...post.media, ...newMedia] } 
        : post
    ));
  };
  
  // Remove media from thread post
  const removeMediaFromThreadPost = (postId, mediaId) => {
    setThreadPosts(threadPosts.map(post => 
      post.id === postId 
        ? { ...post, media: post.media.filter(m => m.id !== mediaId) } 
        : post
    ));
  };
  
  // Handle submit
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (text.trim() === '') {
      return;
    }
    
    // Prepare media for submission
    const prepareMediaForSubmission = (mediaItems) => {
      return mediaItems.map(item => ({
        type: item.type,
        file: item.file
      }));
    };
    
    const postData = {
      text,
      media: prepareMediaForSubmission(media),
      isThread,
      scheduled,
      scheduledTime: scheduled ? scheduledTime.toISOString() : null,
      cronExpression: (scheduled && recurring) ? cronExpression : null,
      cronDescription: (scheduled && recurring) ? cronDescription : null
    };
    
    // Add thread posts if this is a thread
    if (isThread && threadPosts.length > 0) {
      postData.threadPosts = threadPosts.map(post => ({
        text: post.text,
        media: prepareMediaForSubmission(post.media)
      }));
    }
    
    onSubmit(postData);
    
    // Reset form
    setText('');
    setMedia([]);
    setIsThread(false);
    setThreadPosts([]);
    setScheduled(false);
    setRecurring(false);
  };
  
  // Predefined cron schedules
  const predefinedSchedules = [
    { expression: '0 9 * * *', description: 'Every day at 9:00 AM' },
    { expression: '0 12 * * *', description: 'Every day at 12:00 PM' },
    { expression: '0 18 * * *', description: 'Every day at 6:00 PM' },
    { expression: '0 9 * * 1-5', description: 'Weekdays at 9:00 AM' },
    { expression: '0 12 * * 1-5', description: 'Weekdays at 12:00 PM' },
    { expression: '0 18 * * 1-5', description: 'Weekdays at 6:00 PM' },
    { expression: '0 10 * * 6,0', description: 'Weekends at 10:00 AM' },
    { expression: '0 0 1 * *', description: 'First day of each month at midnight' },
  ];
  
  // Update cron expression and description
  const handleCronChange = (event) => {
    const selected = event.target.value;
    const schedule = predefinedSchedules.find(s => s.expression === selected);
    setCronExpression(selected);
    setCronDescription(schedule ? schedule.description : '');
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Verification toggle (for testing) */}
      <div className="flex items-center space-x-2 mb-2">
        <button
          type="button"
          onClick={() => setIsVerified(!isVerified)}
          className={`flex items-center px-3 py-1.5 rounded-full text-sm transition-colors ${
            isVerified 
              ? 'bg-twitter-blue text-white' 
              : 'bg-gray-200 dark:bg-twitter-dark text-gray-700 dark:text-gray-300'
          }`}
        >
          <FaUserCheck className="mr-1.5" />
          {isVerified ? 'Verified Account' : 'Regular Account'}
        </button>
        <span className="text-xs text-gray-500">
          {isVerified ? VERIFIED_CHAR_LIMIT : DEFAULT_CHAR_LIMIT} character limit
        </span>
      </div>
      
      {/* Post text input */}
      <div className="space-y-2">
        <label htmlFor="post-text" className="sr-only">Post content</label>
        <textarea
          id="post-text"
          className="textarea h-24"
          placeholder="What's happening?"
          value={text}
          onChange={(e) => setText(e.target.value)}
          maxLength={MAX_LENGTH}
          required
        />
        <div className={`char-counter text-right ${charCountClass}`}>
          {remainingChars} characters remaining
        </div>
        
        {/* Media preview */}
        {media.length > 0 && (
          <div className="grid grid-cols-2 gap-2 mt-2">
            {media.map(item => (
              <div key={item.id} className="relative group">
                {item.type === 'image' ? (
                  <img 
                    src={item.url} 
                    alt="Media preview" 
                    className="h-32 w-full object-cover rounded-lg border border-gray-300 dark:border-twitter-border"
                  />
                ) : (
                  <video 
                    src={item.url} 
                    className="h-32 w-full object-cover rounded-lg border border-gray-300 dark:border-twitter-border" 
                    controls 
                  />
                )}
                <button
                  type="button"
                  onClick={() => removeMedia(item.id)}
                  className="absolute top-2 right-2 bg-black bg-opacity-70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-label="Remove media"
                >
                  <RiDeleteBinLine />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* Media upload buttons */}
      <div className="flex space-x-2">
        <input 
          type="file" 
          ref={mediaInputRef}
          onChange={handleMediaUpload} 
          accept="image/*, video/*" 
          multiple 
          className="hidden" 
          id="media-upload"
        />
        <button
          type="button"
          onClick={() => mediaInputRef.current.click()}
          disabled={media.length >= 4}
          className="flex items-center space-x-1 text-twitter-blue hover:bg-blue-50 dark:hover:bg-twitter-darker p-2 rounded-full transition-colors"
        >
          <FaImage />
          <span className="text-sm">Media</span>
        </button>
        
        {/* Thread toggle */}
        <button
          type="button"
          onClick={() => setIsThread(!isThread)}
          className={`flex items-center space-x-1 p-2 rounded-full transition-colors ${
            isThread 
              ? 'text-twitter-blue bg-blue-50 dark:bg-twitter-darker' 
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-twitter-darker'
          }`}
        >
          {isThread ? <FaMinus className="mr-1" /> : <FaPlus className="mr-1" />}
          <span className="text-sm">Thread</span>
        </button>
      </div>
      
      {/* Thread posts */}
      {isThread && (
        <div className="mt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-twitter-lightText dark:text-twitter-darkText">Thread Posts</h3>
            <button
              type="button"
              onClick={addThreadPost}
              disabled={threadPosts.length >= 10}
              className="flex items-center text-twitter-blue hover:bg-blue-50 dark:hover:bg-twitter-darker p-1.5 px-3 rounded-full text-sm transition-colors"
            >
              <FaPlus className="mr-1.5" />
              Add Post
            </button>
          </div>
          
          {threadPosts.map((post, index) => (
            <ThreadPostItem
              key={post.id}
              post={post}
              index={index + 2}
              onTextChange={(text) => updateThreadPostText(post.id, text)}
              onRemove={() => removeThreadPost(post.id)}
              onAddMedia={(files) => addMediaToThreadPost(post.id, files)}
              onRemoveMedia={(mediaId) => removeMediaFromThreadPost(post.id, mediaId)}
              maxLength={MAX_LENGTH}
              isVerified={isVerified}
            />
          ))}
        </div>
      )}
      
      {/* Schedule options */}
      <div className="flex items-center space-x-2 mt-4">
        <input
          type="checkbox"
          id="schedule"
          className="w-4 h-4 text-twitter-blue focus:ring-twitter-blue rounded"
          checked={scheduled}
          onChange={() => setScheduled(!scheduled)}
        />
        <label htmlFor="schedule" className="font-medium">
          Schedule this post
        </label>
      </div>
      
      {/* Schedule time picker (visible only when scheduled) */}
      {scheduled && (
        <div className="bg-gray-50 dark:bg-twitter-darker p-4 rounded-lg border border-gray-200 dark:border-twitter-border">
          <div className="mb-4">
            <div className="flex items-center mb-2">
              <FaCalendarAlt className="mr-2 text-twitter-blue" />
              <label htmlFor="scheduled-time" className="font-medium">
                Schedule Time
              </label>
            </div>
            <DatePicker
              id="scheduled-time"
              selected={scheduledTime}
              onChange={date => setScheduledTime(date)}
              showTimeSelect
              dateFormat="MMMM d, yyyy h:mm aa"
              minDate={new Date()}
              className="input"
              placeholderText="Select date and time"
            />
          </div>
          
          <div className="border-t border-gray-200 dark:border-twitter-border pt-4">
            <div className="flex items-center space-x-2 mb-4">
              <input
                type="checkbox"
                id="recurring"
                className="w-4 h-4 text-twitter-blue focus:ring-twitter-blue rounded"
                checked={recurring}
                onChange={() => setRecurring(!recurring)}
              />
              <label htmlFor="recurring" className="font-medium flex items-center">
                <FaClock className="mr-2 text-twitter-blue" />
                Make this a recurring post
              </label>
            </div>
            
            {recurring && (
              <div>
                <label htmlFor="cron-schedule" className="block mb-2 font-medium">
                  Select frequency:
                </label>
                <select
                  id="cron-schedule"
                  className="input"
                  value={cronExpression}
                  onChange={handleCronChange}
                >
                  {predefinedSchedules.map(schedule => (
                    <option key={schedule.expression} value={schedule.expression}>
                      {schedule.description}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Submit button */}
      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary"
          disabled={text.trim() === ''}
        >
          {scheduled ? 'Schedule Post' : 'Post Now'}
        </button>
      </div>
    </form>
  );
};

export default CreatePost;