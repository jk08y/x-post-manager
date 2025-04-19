// server/routes/api.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// Post routes
router.get('/posts', postController.getAllPosts);
router.post('/posts', postController.createPost);
router.post('/posts/schedule', postController.schedulePost);
router.get('/posts/:id', postController.getPostById);
router.put('/posts/:id', postController.updatePost);
router.delete('/posts/:id', postController.deletePost);
router.post('/posts/:id/send', postController.sendPostNow);

module.exports = router;