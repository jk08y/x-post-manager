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
      setLoading(true);
      
      // Prepare form data for file uploads if there's media
      const hasMedia = postData.media && postData.media.length > 0;
      
      let endpoint, requestData;
      
      // Determine endpoint based on scheduling
      endpoint = postData.scheduled ? `${API_URL}/posts/schedule` : `${API_URL}/posts`;
      
      if (hasMedia) {
        // Use FormData for media uploads
        const formData = new FormData();
        
        // Add text content
        formData.append('text', postData.text);
        
        // Add scheduling info if needed
        if (postData.scheduled) {
          formData.append('scheduledTime', postData.scheduledTime);
          
          if (postData.cronExpression) {
            formData.append('cronExpression', postData.cronExpression);
            formData.append('cronDescription', postData.cronDescription);
          }
        }
        
        // Add thread info if this is a thread
        if (postData.isThread) {
          formData.append('isThread', true);
          
          // Add thread posts
          if (postData.threadPosts && postData.threadPosts.length > 0) {
            formData.append('threadPosts', JSON.stringify(postData.threadPosts));
          }
        }
        
        // Add main post media files
        for (const mediaFile of postData.media) {
          formData.append('media', mediaFile.file);
        }
        
        // Use formData as the request payload
        requestData = formData;
      } else {
        // No media, use JSON
        requestData = {
          text: postData.text,
          isThread: postData.isThread || false,
          threadPosts: postData.threadPosts || [],
          scheduledTime: postData.scheduled ? postData.scheduledTime : null,
          cronExpression: (postData.scheduled && postData.cronExpression) ? postData.cronExpression : null,
          cronDescription: (postData.scheduled && postData.cronDescription) ? postData.cronDescription : null
        };
      }
      
      // Send the request
      const response = await axios.post(endpoint, requestData, {
        headers: hasMedia ? {
          'Content-Type': 'multipart/form-data'
        } : {
          'Content-Type': 'application/json'
        }
      });
      
      toast.success(postData.scheduled 
        ? 'Post scheduled successfully!' 
        : 'Post sent successfully!');
      
      // Refetch posts to update the list
      fetchPosts();
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to create post. Please try again.');
      console.error('Error creating post:', err);
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
              <FaSync className="animate-spin mx-auto mb-3 text-twitter-blue" />
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