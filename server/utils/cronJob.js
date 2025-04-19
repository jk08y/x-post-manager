// server/utils/cronJob.js
const cron = require('node-cron');
const Post = require('../models/Post');
const twitterClient = require('../config/twitter');

// Function to post a tweet
async function postTweet(text) {
  try {
    const response = await twitterClient.v2.tweet(text);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Error posting tweet:', error);
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
      
      // Post the tweet
      const result = await postTweet(post.text);
      
      if (result.success) {
        console.log(`Successfully posted tweet for post ID: ${post.id}`);
        
        // If it's a one-time post, mark as sent or delete
        if (!post.cronExpression) {
          Post.markAsSent(post.id);
        }
      } else {
        console.error(`Failed to post tweet for post ID: ${post.id}`, result.error);
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
            postTweet(post.text)
              .then(result => {
                if (result.success) {
                  console.log(`Successfully posted recurring tweet for post ID: ${post.id}`);
                  
                  // Update the last run time
                  Post.updatePost(post.id, {
                    lastRun: now.toISOString()
                  });
                } else {
                  console.error(`Failed to post recurring tweet for post ID: ${post.id}`, result.error);
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