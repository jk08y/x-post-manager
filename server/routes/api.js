// server/routes/api.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const postController = require('../controllers/postController');

// Configure multer for media uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../uploads'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

// Filter function to accept only images and videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'video/mp4', 'video/quicktime'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, MP4, and MOV files are allowed.'), false);
  }
};

// Configure the upload middleware
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB file size limit
  }
});

// Middleware to handle media uploads
const mediaUpload = upload.array('media', 4); // Allow up to 4 media files

// Middleware to handle multer errors
const handleMulterErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // A Multer error occurred when uploading
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({
        success: false,
        error: 'File too large. Maximum size is 20MB.'
      });
    }
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(413).json({
        success: false,
        error: 'Too many files. Maximum is 4 files.'
      });
    }
    return res.status(400).json({
      success: false,
      error: `Upload error: ${err.message}`
    });
  } else if (err) {
    // A non-Multer error occurred
    return res.status(400).json({
      success: false,
      error: err.message
    });
  }
  next();
};

// Add media paths to request body
const processMedia = (req, res, next) => {
  if (req.files && req.files.length > 0) {
    // Transform uploaded files into media objects
    req.body.media = req.files.map(file => ({
      path: file.path,
      filename: file.filename,
      mimetype: file.mimetype,
      size: file.size
    }));
  }
  next();
};

// Post routes
router.get('/posts', postController.getAllPosts);

// Post with media upload handling
router.post('/posts', (req, res, next) => {
  mediaUpload(req, res, (err) => {
    if (err) return handleMulterErrors(err, req, res, next);
    processMedia(req, res, next);
  });
}, postController.createPost);

// Schedule post with media upload handling
router.post('/posts/schedule', (req, res, next) => {
  mediaUpload(req, res, (err) => {
    if (err) return handleMulterErrors(err, req, res, next);
    processMedia(req, res, next);
  });
}, postController.schedulePost);

router.get('/posts/:id', postController.getPostById);

// Update post with media upload handling
router.put('/posts/:id', (req, res, next) => {
  mediaUpload(req, res, (err) => {
    if (err) return handleMulterErrors(err, req, res, next);
    processMedia(req, res, next);
  });
}, postController.updatePost);

router.delete('/posts/:id', postController.deletePost);
router.post('/posts/:id/send', postController.sendPostNow);

module.exports = router;