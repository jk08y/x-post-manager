// client/src/components/PostDetails.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import toast from 'react-hot-toast';
import { FaArrowLeft, FaSave, FaCalendarAlt, FaClock, FaTrash, FaPaperPlane } from 'react-icons/fa';
import { RiTwitterXFill } from 'react-icons/ri';

const API_URL = 'http://localhost:5000/api';
const MAX_LENGTH = 280;

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Form state
  const [text, setText] = useState('');
  const [scheduledTime, setScheduledTime] = useState(new Date());
  const [cronExpression, setCronExpression] = useState('');
  const [cronDescription, setCronDescription] = useState('');
  
  // Fetch post details
  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts/${id}`);
      
      if (response.data.success) {
        const postData = response.data.data;
        setPost(postData);
        setText(postData.text || '');
        
        if (postData.scheduledTime) {
          setScheduledTime(new Date(postData.scheduledTime));
        }
        
        if (postData.cronExpression) {
          setCronExpression(postData.cronExpression);
          setCronDescription(postData.cronDescription || '');
        }
      }
    } catch (err) {
      setError('Failed to fetch post details. Please try again.');
      console.error('Error fetching post details:', err);
    } finally {
      setLoading(false);
    }
  };
  
  // Update post
  const updatePost = async (e) => {
    e.preventDefault();
    
    if (text.trim() === '') {
      toast.error('Post text cannot be empty');
      return;
    }
    
    try {
      const updateData = {
        text,
      };
      
      // Include scheduledTime if present (not for recurring posts)
      if (!cronExpression && scheduledTime) {
        updateData.scheduledTime = scheduledTime.toISOString();
      }
      
      // Include cronExpression if present (for recurring posts)
      if (cronExpression) {
        updateData.cronExpression = cronExpression;
        updateData.cronDescription = cronDescription;
      }
      
      await axios.put(`${API_URL}/posts/${id}`, updateData);
      
      toast.success('Post updated successfully!');
      
      // Go back to previous page
      navigate(-1);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to update post');
      console.error('Error updating post:', err);
    }
  };
  
  // Delete post
  const deletePost = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`${API_URL}/posts/${id}`);
        toast.success('Post deleted successfully!');
        navigate(-1);
      } catch (err) {
        toast.error('Failed to delete post. Please try again.');
        console.error('Error deleting post:', err);
      }
    }
  };
  
  // Send post now
  const sendPostNow = async () => {
    try {
      await axios.post(`${API_URL}/posts/${id}/send`);
      toast.success('Post sent successfully!');
      
      // If not a recurring post, navigate back
      if (!cronExpression) {
        navigate(-1);
      } else {
        // Just update the lastRun time for recurring posts
        fetchPost();
      }
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
  ];
  
  // Handle cron schedule change
  const handleCronChange = (event) => {
    const selected = event.target.value;
    setCronExpression(selected);
    
    // Find the description if it's a predefined schedule
    const schedule = predefinedSchedules.find(s => s.expression === selected);
    if (schedule) {
      setCronDescription(schedule.description);
    }
  };
  
  // Load post data on component mount
  useEffect(() => {
    fetchPost();
  }, [id]);
  
  // Calculate remaining characters
  const remainingChars = MAX_LENGTH - text.length;
  const charCountClass = remainingChars < 20 
    ? 'danger' 
    : remainingChars < 50 
      ? 'warning' 
      : '';
  
  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500 dark:text-gray-400">
        Loading post details...
      </div>
    );
  }
  
  if (error || !post) {
    return (
      <div className="p-6 text-center text-red-500">
        {error || 'Post not found'}
        <div className="mt-4">
          <button
            onClick={() => navigate(-1)}
            className="btn-primary"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <button
          onClick={() => navigate(-1)}
          className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-twitter-darker text-twitter-blue"
          aria-label="Go back"
        >
          <FaArrowLeft />
        </button>
        <h1 className="text-2xl font-bold text-twitter-lightText dark:text-twitter-darkText">
          Edit Post
        </h1>
      </div>
      
      <div className="card shadow-lg">
        <div className="p-6 border-b border-gray-200 dark:border-twitter-border">
          <h2 className="text-xl font-bold flex items-center text-twitter-lightText dark:text-twitter-darkText">
            <RiTwitterXFill className="mr-3 text-twitter-blue" />
            Edit Post Details
          </h2>
        </div>
        <div className="p-6">
          <form onSubmit={updatePost} className="space-y-6">
            <div>
              <label htmlFor="post-text" className="block mb-2 font-medium">
                Post Content
              </label>
              <textarea
                id="post-text"
                className="textarea h-32"
                placeholder="What's happening?"
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={MAX_LENGTH}
                required
              />
              <div className={`char-counter text-right ${charCountClass}`}>
                {remainingChars} characters remaining
              </div>
            </div>
            
            {/* Scheduled time (only for non-recurring posts) */}
            {!cronExpression && (
              <div className="bg-gray-50 dark:bg-twitter-darker p-4 rounded-lg border border-gray-200 dark:border-twitter-border">
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
                />
              </div>
            )}
            
            {/* Cron schedule (only for recurring posts) */}
            {cronExpression && (
              <div className="bg-gray-50 dark:bg-twitter-darker p-4 rounded-lg border border-gray-200 dark:border-twitter-border">
                <div className="flex items-center mb-2">
                  <FaClock className="mr-2 text-twitter-blue" />
                  <label htmlFor="cron-schedule" className="font-medium">
                    Recurring Schedule
                  </label>
                </div>
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
                <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">
                  This post will be sent: {cronDescription}
                </p>
                
                {post.lastRun && (
                  <div className="mt-3 text-gray-500 dark:text-gray-400 text-sm">
                    Last sent: {new Date(post.lastRun).toLocaleString()}
                  </div>
                )}
              </div>
            )}
            
            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-between pt-4 border-t border-gray-200 dark:border-twitter-border">
              <div>
                <button
                  type="button"
                  onClick={deletePost}
                  className="btn-danger flex items-center"
                >
                  <FaTrash className="mr-2" />
                  Delete Post
                </button>
              </div>
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={sendPostNow}
                  className="btn-secondary flex items-center"
                >
                  <FaPaperPlane className="mr-2" />
                  Send Now
                </button>
                
                <button
                  type="submit"
                  className="btn-primary flex items-center"
                >
                  <FaSave className="mr-2" />
                  Save Changes
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostDetails;