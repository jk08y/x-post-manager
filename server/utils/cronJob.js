// server/utils/cronJob.js
const cron = require('node-cron');
const Post = require('../models/Post');
const twitterClient = require('../config/twitter');

// Helper function to upload media to Twitter
async function uploadMedia(mediaFiles) {
  try {
    const mediaIds = [];
    
    // Process each media file
    for (const mediaItem of mediaFiles) {
      // Upload the media file to Twitter
      const mediaId = await twitterClient.v1.uploadMedia(mediaItem.path);
      mediaIds.push(mediaId);
    }
    
    return { success: true, mediaIds };
  } catch (error) {
    console.error('Error uploading media:', error);
    return { success: false, error: error.message };
  }
}

// Function to post a tweet with media
async function postTweet(text, media = [], replyToId = null) {
  try {
    // Handle media upload if there are media files
    let mediaIds = [];
    if (media && media.length > 0) {
      const mediaUpload = await uploadMedia(media);
      if (!mediaUpload.success) {
        throw new Error(`Failed to upload media: ${mediaUpload.error}`);
      }
      mediaIds = mediaUpload.mediaIds;
    }
    
    // Prepare tweet options
    const tweetOptions = {
      media: mediaIds.length > 0 ? { media_ids: mediaIds } : undefined
    };
    
    // Add reply options if this is a reply
    if (replyToId) {
      tweetOptions.reply = { in_reply_to_tweet_id: replyToId };
    }
    
    // Post to Twitter
    const response = await twitterClient.v2.tweet(text, tweetOptions);
    
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error posting tweet:', error);
    return { success: false, error: error.message };
  }
}

// Function to post a thread
async function postThread(posts) {
  try {
    let previousTweetId = null;
    const tweetIds = [];
    
    // Post each tweet in the thread
    for (const [index, post] of posts.entries()) {
      const result = await postTweet(post.text, post.media, previousTweetId);
      
      if (!result.success) {
        throw new Error(`Failed to post thread tweet ${index + 1}: ${result.error}`);
      }
      
      previousTweetId = result.data.id;
      tweetIds.push(previousTweetId);
    }
    
    return { success: true, tweetIds };
  } catch (error) {
    console.error('Error posting thread:', error);
    return { success: false, error: error.message };
  }
}

// Function to check for posts due now and send them
async function checkAndSendScheduledPosts() {
  try {
    // Get posts that are due now
    const duePosts = Post.getPostsDueNow();
    
    for (const post of duePosts) {
      console.log(`Sending scheduled post: ${post.id}`);
      
      // Handle thread or single post
      let result;
      
      if (post.isThread) {
        // Prepare thread posts
        const thread = [
          { text: post.text, media: post.media || [] }
        ];
        
        // Add additional thread posts
        if (post.threadPosts && post.threadPosts.length > 0) {
          thread.push(...post.threadPosts);
        }
        
        // Post the thread
        result = await postThread(thread);
      } else {
        // Post single tweet
        result = await postTweet(post.text, post.media || []);
      }
      
      if (result.success) {
        console.log(`Successfully posted ${post.isThread ? 'thread' : 'tweet'} for post ID: ${post.id}`);
        
        // If it's a one-time post, mark as sent
        if (!post.cronExpression) {
          Post.markAsSent(post.id);
        }
      } else {
        console.error(`Failed to post ${post.isThread ? 'thread' : 'tweet'} for post ID: ${post.id}`, result.error);
      }
    }

    // Handle recurring posts based on cron expressions
    const recurringPosts = Post.getRecurringPosts();
    const now = new Date();
    
    recurringPosts.forEach(post => {
      if (post.cronExpression && cron.validate(post.cronExpression)) {
        // Check if the post should be sent at this time
        const task = cron.schedule(post.cronExpression, () => {}, { scheduled: false });
        
        // Get the last execution time
        const lastExecution = task.getLastExecutionDate ? task.getLastExecutionDate() : null;
        
        // Check if it's due in the current minute
        if (lastExecution) {
          const diff = now.getTime() - lastExecution.getTime();
          const isDueNow = diff < 60000 && diff >= 0; // Due within the last minute
          
          if (isDueNow) {
            console.log(`Sending recurring post: ${post.id}`);
            
            // Handle thread or single post
            let sendPromise;
            
            if (post.isThread) {
              // Prepare thread posts
              const thread = [
                { text: post.text, media: post.media || [] }
              ];
              
              // Add additional thread posts
              if (post.threadPosts && post.threadPosts.length > 0) {
                thread.push(...post.threadPosts);
              }
              
              // Post the thread
              sendPromise = postThread(thread);
            } else {
              // Post single tweet
              sendPromise = postTweet(post.text, post.media || []);
            }
            
            // Process the result
            sendPromise
              .then(result => {
                if (result.success) {
                  console.log(`Successfully posted recurring ${post.isThread ? 'thread' : 'tweet'} for post ID: ${post.id}`);
                  
                  // Update the last run time
                  Post.updatePost(post.id, {
                    lastRun: now.toISOString()
                  });
                } else {
                  console.error(`Failed to post recurring ${post.isThread ? 'thread' : 'tweet'} for post ID: ${post.id}`, result.error);
                }
              })
              .catch(error => {
                console.error(`Error processing recurring post ${post.id}:`, error);
              });
          }
        }
        
        task.destroy();
      }
    });
  } catch (error) {
    console.error('Error in checkAndSendScheduledPosts:', error);
  }
}

module.exports = {
  checkAndSendScheduledPosts
};