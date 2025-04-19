// server/config/twitter.js
const { TwitterApi } = require('twitter-api-v2');
const dotenv = require('dotenv');

dotenv.config();

// Create a Twitter API client
const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_TOKEN_SECRET,
});

// Get a read-write client
const rwClient = twitterClient.readWrite;

module.exports = rwClient;