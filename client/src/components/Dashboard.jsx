// client/src/components/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { FaSync, FaCalendarCheck } from 'react-icons/fa';
import { RiTwitterXFill } from 'react-icons/ri';
import CreatePost from './CreatePost';
import PostItem from './PostItem';

const API_URL = 'http://localhost:5000/api';

const Dashboard = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch scheduled posts
  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts`);
      
      // Sort posts by scheduled time (most recent first)
      const sortedPosts = response.data.data.sort((a, b) => {
        if (!a.scheduledTime) return -1;
        if (!b.scheduledTime) return 1;
        return new Date(a.scheduledTime) - new Date(b.scheduledTime);
      });
      
      // Only show upcoming posts (not sent ones)
      const upcomingPosts = sortedPosts.filter(post => !post.sent);
      
      setPosts(upcomingPosts);
      setError(null);
    } catch (err) {
      setError('Failed to fetch posts. Please try again.');
      console.error('Error fetching posts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Create a new post
  const createPost = async (postData) => {
    try {
      // If post is scheduled, use schedule endpoint
      let endpoint = postData.scheduled ? `${API_URL}/posts/schedule` : `${API_URL}/posts`;
      
      // Prepare the data for API call
      const apiData = postData.scheduled 
        ? { 
            text: postData.text, 
            scheduledTime: postData.scheduledTime,
            cronExpression: postData.cronExpression,
            cronDescription: postData.cronDescription
          }
        : { text: postData.text };
      
      await axios.post(endpoint, apiData);
      
      toast.success(postData.scheduled 
        ? 'Post scheduled successfully!' 
        : 'Post sent successfully!');
      
      // Refetch posts to update the list
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create post. Please try again.');
      console.error('Error creating post:', err);
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
    fetchPosts();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-twitter-lightText dark:text-twitter-darkText">
        Dashboard
      </h1>
      
      {/* Create post form */}
      <div className="card">
        <div className="p-4 sm:p-6">
          <h2 className="text-xl font-bold mb-4 text-twitter-lightText dark:text-twitter-darkText">
            Create New Post
          </h2>
          <CreatePost onSubmit={createPost} />
        </div>
      </div>
      
      {/* Upcoming posts */}
      <div className="card">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-twitter-border">
          <h2 className="text-xl font-bold text-twitter-lightText dark:text-twitter-darkText">
            Upcoming Posts
          </h2>
          <button 
            onClick={fetchPosts}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-darker"
            aria-label="Refresh posts"
          >
            <FaSync className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
        
        <div>
          {loading ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              Loading posts...
            </div>
          ) : error ? (
            <div className="p-6 text-center text-red-500">
              {error}
            </div>
          ) : posts.length === 0 ? (
            <div className="p-6 text-center text-gray-500 dark:text-gray-400">
              No upcoming posts scheduled.
            </div>
          ) : (
            <ul>
              {posts.map(post => (
                <PostItem 
                  key={post.id} 
                  post={post} 
                  onDelete={deletePost}
                  onSendNow={sendPostNow}
                />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;