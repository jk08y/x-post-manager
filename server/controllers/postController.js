// server/controllers/postController.js
const Post = require('../models/Post');
const twitterClient = require('../config/twitter');

// Get all scheduled posts
exports.getAllPosts = async (req, res) => {
  try {
    const posts = Post.getAllScheduledPosts();
    res.status(200).json({ success: true, data: posts });
  } catch (error) {
    console.error('Error getting all posts:', error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Create a post and send it immediately
exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, error: 'Post text is required' });
    }

    // Try to post to Twitter
    const twitterResponse = await twitterClient.v2.tweet(text);
    
    if (twitterResponse) {
      res.status(201).json({ 
        success: true, 
        message: 'Post sent successfully',
        data: {
          text,
          tweetId: twitterResponse.data.id
        }
      });
    } else {
      res.status(500).json({ success: false, error: 'Failed to send post' });
    }
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error'
    });
  }
};

// Schedule a post for later
exports.schedulePost = async (req, res) => {
  try {
    const { text, scheduledTime, cronExpression, cronDescription } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, error: 'Post text is required' });
    }

    if (!scheduledTime && !cronExpression) {
      return res.status(400).json({ 
        success: false, 
        error: 'Either scheduledTime or cronExpression is required' 
      });
    }

    // Create a new scheduled post
    const postData = {
      text,
      scheduledTime: scheduledTime || null,
      cronExpression: cronExpression || null,
      cronDescription: cronDescription || null,
      sent: false,
      createdAt: new Date().toISOString()
    };

    const result = Post.createScheduledPost(postData);
    
    if (result.success) {
      res.status(201).json({ 
        success: true, 
        message: 'Post scheduled successfully',
        data: result.post
      });
    } else {
      res.status(500).json({ 
        success: false, 
        error: result.error || 'Failed to schedule post' 
      });
    }
  } catch (error) {
    console.error('Error scheduling post:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error'
    });
  }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = Post.getPostById(id);
    
    if (result.success) {
      res.status(200).json({ success: true, data: result.post });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error(`Error getting post ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Update a post
exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { text, scheduledTime, cronExpression, cronDescription } = req.body;
    
    // Make sure at least one field is provided
    if (!text && !scheduledTime && !cronExpression) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one field is required to update' 
      });
    }

    // Create update object with only provided fields
    const updateData = {};
    if (text) updateData.text = text;
    if (scheduledTime !== undefined) updateData.scheduledTime = scheduledTime;
    if (cronExpression !== undefined) updateData.cronExpression = cronExpression;
    if (cronDescription !== undefined) updateData.cronDescription = cronDescription;

    const result = Post.updatePost(id, updateData);
    
    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: 'Post updated successfully',
        data: result.post
      });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error(`Error updating post ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error'
    });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const result = Post.deletePost(id);
    
    if (result.success) {
      res.status(200).json({ 
        success: true, 
        message: 'Post deleted successfully' 
      });
    } else {
      res.status(404).json({ success: false, error: result.error });
    }
  } catch (error) {
    console.error(`Error deleting post ${req.params.id}:`, error);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

// Send a scheduled post now
exports.sendPostNow = async (req, res) => {
  try {
    const { id } = req.params;
    const result = Post.getPostById(id);
    
    if (!result.success) {
      return res.status(404).json({ success: false, error: result.error });
    }

    // Try to post to Twitter
    const twitterResponse = await twitterClient.v2.tweet(result.post.text);
    
    if (twitterResponse) {
      // Mark post as sent if it's not a recurring post
      if (!result.post.cronExpression) {
        Post.markAsSent(id);
      } else {
        // Update last run time for recurring posts
        Post.updatePost(id, {
          lastRun: new Date().toISOString()
        });
      }
      
      res.status(200).json({ 
        success: true, 
        message: 'Post sent successfully',
        data: {
          tweetId: twitterResponse.data.id
        }
      });
    } else {
      res.status(500).json({ success: false, error: 'Failed to send post' });
    }
  } catch (error) {
    console.error(`Error sending post ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error'
    });
  }
};