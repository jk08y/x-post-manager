// server/controllers/postController.js
const Post = require('../models/Post');
const twitterClient = require('../config/twitter');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Helper function to upload media to Twitter
async function uploadMedia(mediaFiles) {
  try {
    const mediaIds = [];
    
    // Process each media file
    for (const mediaFile of mediaFiles) {
      // In a real implementation, we would read the file from disk
      // This assumes mediaFile contains the path to the file on server
      const mediaId = await twitterClient.v1.uploadMedia(mediaFile.path);
      mediaIds.push(mediaId);
    }
    
    return { success: true, mediaIds };
  } catch (error) {
    console.error('Error uploading media:', error);
    return { success: false, error: error.message };
  }
}

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
    const { text, media = [], isThread = false, threadPosts = [] } = req.body;
    
    if (!text || text.trim() === '') {
      return res.status(400).json({ success: false, error: 'Post text is required' });
    }

    // Initialize response data
    const responseData = {
      text,
      isThread,
      tweetIds: []
    };

    // Simple post (no thread)
    if (!isThread) {
      // Handle media upload if there are media files
      let mediaIds = [];
      if (media && media.length > 0) {
        const mediaUpload = await uploadMedia(media);
        if (!mediaUpload.success) {
          return res.status(500).json({ 
            success: false, 
            error: `Failed to upload media: ${mediaUpload.error}` 
          });
        }
        mediaIds = mediaUpload.mediaIds;
      }

      // Post to Twitter
      const twitterResponse = await twitterClient.v2.tweet(text, { 
        media: mediaIds.length > 0 ? { media_ids: mediaIds } : undefined 
      });
      
      if (twitterResponse) {
        responseData.tweetIds.push(twitterResponse.data.id);
      } else {
        return res.status(500).json({ success: false, error: 'Failed to send post' });
      }
    } 
    // Thread post
    else {
      // Initialize thread data
      const thread = [
        { text, media }
      ];
      
      // Add additional thread posts
      if (threadPosts && threadPosts.length > 0) {
        thread.push(...threadPosts);
      }
      
      // Post the first tweet
      let previousTweetId = null;
      
      // Process each tweet in the thread
      for (const [index, post] of thread.entries()) {
        // Handle media upload if there are media files
        let mediaIds = [];
        if (post.media && post.media.length > 0) {
          const mediaUpload = await uploadMedia(post.media);
          if (!mediaUpload.success) {
            return res.status(500).json({ 
              success: false, 
              error: `Failed to upload media for thread post ${index + 1}: ${mediaUpload.error}` 
            });
          }
          mediaIds = mediaUpload.mediaIds;
        }
        
        // Post to Twitter
        const tweetOptions = { 
          media: mediaIds.length > 0 ? { media_ids: mediaIds } : undefined
        };
        
        // Add in_reply_to_tweet_id for posts after the first one
        if (previousTweetId) {
          tweetOptions.reply = { in_reply_to_tweet_id: previousTweetId };
        }
        
        const twitterResponse = await twitterClient.v2.tweet(post.text, tweetOptions);
        
        if (twitterResponse) {
          previousTweetId = twitterResponse.data.id;
          responseData.tweetIds.push(previousTweetId);
        } else {
          return res.status(500).json({ 
            success: false, 
            error: `Failed to post thread tweet ${index + 1}` 
          });
        }
      }
    }
    
    // Return the response data
    res.status(201).json({ 
      success: true, 
      message: isThread ? 'Thread posted successfully' : 'Post sent successfully',
      data: responseData
    });
    
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
    const { 
      text, 
      media = [], 
      isThread = false, 
      threadPosts = [], 
      scheduledTime, 
      cronExpression, 
      cronDescription 
    } = req.body;
    
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
      media,
      isThread,
      threadPosts,
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
    const { 
      text, 
      media, 
      isThread, 
      threadPosts, 
      scheduledTime, 
      cronExpression, 
      cronDescription 
    } = req.body;
    
    // Make sure at least one field is provided
    if (!text && scheduledTime === undefined && cronExpression === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'At least one field is required to update' 
      });
    }

    // Create update object with only provided fields
    const updateData = {};
    if (text !== undefined) updateData.text = text;
    if (media !== undefined) updateData.media = media;
    if (isThread !== undefined) updateData.isThread = isThread;
    if (threadPosts !== undefined) updateData.threadPosts = threadPosts;
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

    const post = result.post;
    
    // Response data
    const responseData = {
      text: post.text,
      isThread: post.isThread || false,
      tweetIds: []
    };

    // Send a single post
    if (!post.isThread) {
      // Handle media upload if there are media files
      let mediaIds = [];
      if (post.media && post.media.length > 0) {
        const mediaUpload = await uploadMedia(post.media);
        if (!mediaUpload.success) {
          return res.status(500).json({ 
            success: false, 
            error: `Failed to upload media: ${mediaUpload.error}` 
          });
        }
        mediaIds = mediaUpload.mediaIds;
      }

      // Post to Twitter
      const twitterResponse = await twitterClient.v2.tweet(post.text, {
        media: mediaIds.length > 0 ? { media_ids: mediaIds } : undefined
      });
      
      if (twitterResponse) {
        responseData.tweetIds.push(twitterResponse.data.id);
      } else {
        return res.status(500).json({ success: false, error: 'Failed to send post' });
      }
    } 
    // Send a thread
    else {
      // Initialize thread data
      const thread = [
        { text: post.text, media: post.media || [] }
      ];
      
      // Add additional thread posts
      if (post.threadPosts && post.threadPosts.length > 0) {
        thread.push(...post.threadPosts);
      }
      
      // Post the thread
      let previousTweetId = null;
      
      // Process each tweet in the thread
      for (const [index, threadPost] of thread.entries()) {
        // Handle media upload if there are media files
        let mediaIds = [];
        if (threadPost.media && threadPost.media.length > 0) {
          const mediaUpload = await uploadMedia(threadPost.media);
          if (!mediaUpload.success) {
            return res.status(500).json({ 
              success: false, 
              error: `Failed to upload media for thread post ${index + 1}: ${mediaUpload.error}` 
            });
          }
          mediaIds = mediaUpload.mediaIds;
        }
        
        // Post to Twitter
        const tweetOptions = {
          media: mediaIds.length > 0 ? { media_ids: mediaIds } : undefined
        };
        
        // Add in_reply_to_tweet_id for posts after the first one
        if (previousTweetId) {
          tweetOptions.reply = { in_reply_to_tweet_id: previousTweetId };
        }
        
        const twitterResponse = await twitterClient.v2.tweet(threadPost.text, tweetOptions);
        
        if (twitterResponse) {
          previousTweetId = twitterResponse.data.id;
          responseData.tweetIds.push(previousTweetId);
        } else {
          return res.status(500).json({ 
            success: false, 
            error: `Failed to post thread tweet ${index + 1}` 
          });
        }
      }
    }
    
    // Mark post as sent if it's not a recurring post
    if (!post.cronExpression) {
      Post.markAsSent(id);
    } else {
      // Update last run time for recurring posts
      Post.updatePost(id, {
        lastRun: new Date().toISOString()
      });
    }
    
    res.status(200).json({ 
      success: true, 
      message: post.isThread ? 'Thread sent successfully' : 'Post sent successfully',
      data: responseData
    });
    
  } catch (error) {
    console.error(`Error sending post ${req.params.id}:`, error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Server error'
    });
  }
};