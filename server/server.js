// server/server.js
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const cron = require('node-cron');
const apiRoutes = require('./routes/api');
const { checkAndSendScheduledPosts } = require('./utils/cronJob');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Create scheduled_posts directory if it doesn't exist
const scheduledPostsDir = path.join(__dirname, 'scheduled_posts');
if (!fs.existsSync(scheduledPostsDir)) {
  fs.mkdirSync(scheduledPostsDir, { recursive: true });
}

// Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'X Post Manager API is running' });
});

// Setup cron job to check for scheduled posts every minute
cron.schedule('* * * * *', () => {
  console.log('Running cron job to check for scheduled posts...');
  checkAndSendScheduledPosts();
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});