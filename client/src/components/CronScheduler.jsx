// client/src/components/CronScheduler.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSync, FaClock, FaPlus, FaMinus, FaCalendarAlt, FaRobot } from 'react-icons/fa';
import { RiTwitterXFill } from 'react-icons/ri';
import PostItem from './PostItem';
import cronstrue from 'cronstrue';

const API_URL = 'http://localhost:5000/api';

const CronScheduler = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPostText, setNewPostText] = useState('');
  const [cronExpression, setCronExpression] = useState('0 12 * * *');
  const [cronDescription, setCronDescription] = useState('Every day at 12:00 PM');

  // Fetch recurring posts
  const fetchRecurringPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts`);
      
      // Filter to show only recurring posts (with cronExpression)
      const recurringPosts = response.data.data
        .filter(post => post.cronExpression)
        .sort((a, b) => {
          // Sort by lastRun date if available (most recent first)
          if (a.lastRun && b.lastRun) {
            return new Date(b.lastRun) - new Date(a.lastRun);
          }
          // Or by created date
          return new Date(b.createdAt) - new Date(a.createdAt);
        });
      
      setPosts(recurringPosts);
      setError(null);
    } catch (err) {
      setError('Failed to fetch recurring posts. Please try again.');
      console.error('Error fetching recurring posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new recurring post
  const createRecurringPost = async (e) => {
    e.preventDefault();
    
    if (newPostText.trim() === '') {
      toast.error('Post text cannot be empty');
      return;
    }
    
    try {
      await axios.post(`${API_URL}/posts/schedule`, {
        text: newPostText,
        cronExpression,
        cronDescription
      });
      
      toast.success('Recurring post created successfully!');
      setNewPostText('');
      setShowCreateForm(false);
      fetchRecurringPosts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create recurring post');
      console.error('Error creating recurring post:', err);
    }
  };

  // Delete a post
  const deletePost = async (id) => {
    try {
      await axios.delete(`${API_URL}/posts/${id}`);
      setPosts(posts.filter(post => post.id !== id));
      toast.success('Post deleted successfully!');
    } catch (err) {
      toast.error('Failed to delete post. Please try again.');
      console.error('Error deleting post:', err);
    }
  };

  // Send a post now
  const sendPostNow = async (id) => {
    try {
      await axios.post(`${API_URL}/posts/${id}/send`);
      
      // Update the lastRun time for the post in the UI
      setPosts(posts.map(post => {
        if (post.id === id) {
          return { ...post, lastRun: new Date().toISOString() };
        }
        return post;
      }));
      
      toast.success('Post sent successfully!');
    } catch (err) {
      toast.error('Failed to send post. Please try again.');
      console.error('Error sending post:', err);
    }
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
    { expression: '0 0 * * 1', description: 'Every Monday at midnight' },
    { expression: '0 0 * * 5', description: 'Every Friday at midnight' },
  ];

  // Handle cron schedule change
  const handleCronChange = (event) => {
    const selected = event.target.value;
    setCronExpression(selected);
    
    // Find the description if it's a predefined schedule
    const schedule = predefinedSchedules.find(s => s.expression === selected);
    if (schedule) {
      setCronDescription(schedule.description);
    } else {
      // Use cronstrue to parse custom expressions
      try {
        setCronDescription(cronstrue.toString(selected));
      } catch (err) {
        setCronDescription('Custom schedule');
      }
    }
  };

  // Calculate remaining characters
  const MAX_LENGTH = 280;
  const remainingChars = MAX_LENGTH - newPostText.length;
  const charCountClass = remainingChars < 20 
    ? 'danger' 
    : remainingChars < 50 
      ? 'warning' 
      : '';

  // Fetch posts on component mount
  useEffect(() => {
    fetchRecurringPosts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center text-twitter-lightText dark:text-twitter-darkText">
          <FaRobot className="mr-3 text-twitter-blue" />
          Recurring Posts
        </h1>
        <div className="flex gap-2">
          <button 
            onClick={fetchRecurringPosts}
            className="btn-outline p-2.5 !py-2 !px-3"
            aria-label="Refresh recurring posts"
          >
            <FaSync className={`text-twitter-blue ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCreateForm(!showCreateForm)}
            className="btn-primary text-sm"
          >
            {showCreateForm ? (
              <>
                <FaMinus className="mr-2" />
                Cancel
              </>
            ) : (
              <>
                <FaPlus className="mr-2" />
                New Recurring Post
              </>
            )}
          </button>
        </div>
      </div>
      
      {showCreateForm && (
        <div className="card">
          <div className="p-5 border-b border-gray-200 dark:border-twitter-border">
            <h3 className="text-lg font-bold flex items-center text-twitter-lightText dark:text-twitter-darkText">
              <RiTwitterXFill className="mr-2 text-twitter-blue" />
              Create New Recurring Post
            </h3>
          </div>
          <div className="p-5 bg-white dark:bg-twitter-darker">
            <form onSubmit={createRecurringPost} className="space-y-5">
              <div>
                <label htmlFor="post-text" className="block mb-2 font-medium">
                  Post Content
                </label>
                <textarea
                  id="post-text"
                  className="textarea h-24"
                  placeholder="What's happening?"
                  value={newPostText}
                  onChange={(e) => setNewPostText(e.target.value)}
                  maxLength={280}
                  required
                />
                <div className={`char-counter text-right mt-1 ${charCountClass}`}>
                  {remainingChars} characters remaining
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-twitter-dark rounded-xl p-4 border border-gray-200 dark:border-twitter-border">
                <label htmlFor="cron-schedule" className="block mb-2 font-medium flex items-center">
                  <FaClock className="mr-2 text-twitter-blue" />
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
                <p className="mt-3 text-gray-600 dark:text-gray-300 text-sm flex items-center">
                  <FaCalendarAlt className="mr-2 text-twitter-blue" />
                  This post will post automatically: <span className="font-medium ml-1">{cronDescription}</span>
                </p>
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={newPostText.trim() === ''}
                >
                  <FaRobot className="mr-2" />
                  Create Recurring Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      <div className="card">
        <div className="p-5 border-b border-gray-200 dark:border-twitter-border">
          <h2 className="text-xl font-bold flex items-center text-twitter-lightText dark:text-twitter-darkText">
            <FaClock className="mr-3 text-twitter-blue" />
            Automated Recurring Posts
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            These posts will be sent automatically according to their schedule.
          </p>
        </div>
        
        <div>
          {loading ? (
            <div className="flex items-center justify-center p-10 text-gray-500 dark:text-gray-400">
              <FaSync className="animate-spin mr-3 text-twitter-blue" />
              <span>Loading recurring posts...</span>
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-10 text-center">
              <FaClock className="mx-auto text-4xl text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-gray-500 dark:text-gray-400 text-lg">
                No recurring posts yet.
              </p>
              <p className="text-gray-500 dark:text-gray-400 mt-1">
                Create one to automate your posting schedule.
              </p>
              {!showCreateForm && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="btn-primary mt-4"
                >
                  <FaPlus className="mr-2" />
                  New Recurring Post
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-200 dark:divide-twitter-border">
              {posts.map(post => (
                <PostItem 
                  key={post.id} 
                  post={post} 
                  onDelete={deletePost}
                  onSendNow={sendPostNow}
                  onEdit={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CronScheduler;