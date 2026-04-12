const express = require('express');
const router = express.Router();

const userController = require('../controllers/user.controller');
const { auth } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');

// @route   GET /api/users/me
// @desc    Get current logged in user profile
// @access  Private
router.get('/me', auth, userController.getProfile);

// @route   PUT /api/users/profile-picture
// @desc    Upload or update user profile picture
// @access  Private
router.put(
  '/profile-picture',
  auth,
  upload.single('profilePicture'),
  userController.uploadProfilePicture
);

module.exports = router;
