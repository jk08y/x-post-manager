// client/src/components/ScheduledPosts.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSync, FaCalendarAlt } from 'react-icons/fa';
import PostItem from './PostItem';

const API_URL = 'http://localhost:5000/api';

const ScheduledPosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch scheduled posts
  const fetchScheduledPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts`);
      
      // Filter out recurring posts and only show non-sent posts with scheduledTime
      const scheduledPosts = response.data.data
        .filter(post => post.scheduledTime && !post.cronExpression && !post.sent)
        .sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
      
      setPosts(scheduledPosts);
      setError(null);
    } catch (err) {
      setError('Failed to fetch scheduled posts. Please try again.');
      console.error('Error fetching scheduled posts:', err);
    } finally {
      setLoading(false);
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
      setPosts(posts.filter(post => post.id !== id));
      toast.success('Post sent successfully!');
    } catch (err) {
      toast.error('Failed to send post. Please try again.');
      console.error('Error sending post:', err);
    }
  };

  // Fetch posts on component mount
  useEffect(() => {
    fetchScheduledPosts();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center text-twitter-lightText dark:text-twitter-darkText">
          <FaCalendarAlt className="mr-3 text-twitter-blue" />
          Scheduled Posts
        </h1>
        <button 
          onClick={fetchScheduledPosts}
          className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-darker"
          aria-label="Refresh scheduled posts"
        >
          <FaSync className={loading ? 'animate-spin' : ''} />
        </button>
      </div>
      
      <div className="card">
        <div className="p-4 border-b border-gray-200 dark:border-twitter-border">
          <h2 className="text-xl font-bold flex items-center text-twitter-lightText dark:text-twitter-darkText">
            <FaCalendarAlt className="mr-3 text-twitter-blue" />
            Upcoming Scheduled Posts
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            These posts will be sent automatically at their scheduled times.
          </p>
        </div>
        
        <div>
          {loading ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Loading scheduled posts...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No scheduled posts. Go to Dashboard to create one.
            </div>
          ) : (
            <ul>
              {posts.map(post => (
                <PostItem 
                  key={post.id} 
                  post={post} 
                  onDelete={deletePost}
                  onSendNow={sendPostNow}
                  onEdit={true}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScheduledPosts;