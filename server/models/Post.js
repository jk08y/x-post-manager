// server/models/Post.js
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class Post {
  constructor() {
    this.directory = path.join(__dirname, '..', 'scheduled_posts');
    
    // Ensure directory exists
    if (!fs.existsSync(this.directory)) {
      fs.mkdirSync(this.directory, { recursive: true });
    }
  }

  // Get all scheduled posts
  getAllScheduledPosts() {
    try {
      const files = fs.readdirSync(this.directory);
      const scheduledPosts = [];

      files.forEach(file => {
        if (file.endsWith('.json')) {
          const fileContent = fs.readFileSync(path.join(this.directory, file), 'utf8');
          const postData = JSON.parse(fileContent);
          scheduledPosts.push({
            ...postData,
            id: path.basename(file, '.json')
          });
        }
      });

      // Sort by scheduled time
      return scheduledPosts.sort((a, b) => new Date(a.scheduledTime) - new Date(b.scheduledTime));
    } catch (error) {
      console.error('Error getting scheduled posts:', error);
      return [];
    }
  }

  // Get posts scheduled with recurring pattern (cron)
  getRecurringPosts() {
    try {
      const allPosts = this.getAllScheduledPosts();
      return allPosts.filter(post => post.cronExpression);
    } catch (error) {
      console.error('Error getting recurring posts:', error);
      return [];
    }
  }

  // Create a new scheduled post
  createScheduledPost(postData) {
    try {
      const id = uuidv4();
      const filename = `${id}.json`;
      const filePath = path.join(this.directory, filename);

      const post = {
        ...postData,
        createdAt: new Date().toISOString()
      };

      fs.writeFileSync(filePath, JSON.stringify(post, null, 2));
      return { success: true, id, post };
    } catch (error) {
      console.error('Error creating scheduled post:', error);
      return { success: false, error: error.message };
    }
  }

  // Get a specific post by ID
  getPostById(id) {
    try {
      const filePath = path.join(this.directory, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'Post not found' };
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const post = JSON.parse(fileContent);

      return { success: true, post: { ...post, id } };
    } catch (error) {
      console.error(`Error getting post ${id}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Update a post
  updatePost(id, updatedData) {
    try {
      const filePath = path.join(this.directory, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'Post not found' };
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const post = JSON.parse(fileContent);

      const updatedPost = {
        ...post,
        ...updatedData,
        updatedAt: new Date().toISOString()
      };

      fs.writeFileSync(filePath, JSON.stringify(updatedPost, null, 2));
      return { success: true, post: { ...updatedPost, id } };
    } catch (error) {
      console.error(`Error updating post ${id}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Delete a post
  deletePost(id) {
    try {
      const filePath = path.join(this.directory, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'Post not found' };
      }

      fs.unlinkSync(filePath);
      return { success: true };
    } catch (error) {
      console.error(`Error deleting post ${id}:`, error);
      return { success: false, error: error.message };
    }
  }

  // Get posts that need to be sent now
  getPostsDueNow() {
    try {
      const now = new Date();
      const posts = this.getAllScheduledPosts();
      
      // Filter posts that are due now and not recurring
      return posts.filter(post => {
        const scheduledTime = new Date(post.scheduledTime);
        return !post.cronExpression && 
               scheduledTime <= now && 
               !post.sent;
      });
    } catch (error) {
      console.error('Error getting posts due now:', error);
      return [];
    }
  }
  
  // Mark a post as sent
  markAsSent(id) {
    try {
      const filePath = path.join(this.directory, `${id}.json`);
      
      if (!fs.existsSync(filePath)) {
        return { success: false, error: 'Post not found' };
      }

      const fileContent = fs.readFileSync(filePath, 'utf8');
      const post = JSON.parse(fileContent);

      const updatedPost = {
        ...post,
        sent: true,
        sentAt: new Date().toISOString()
      };

      fs.writeFileSync(filePath, JSON.stringify(updatedPost, null, 2));
      return { success: true, post: { ...updatedPost, id } };
    } catch (error) {
      console.error(`Error marking post ${id} as sent:`, error);
      return { success: false, error: error.message };
    }
  }
}

module.exports = new Post();