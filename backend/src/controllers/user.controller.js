const prisma = require('../utils/prisma');
const fs = require('fs');
const path = require('path');

/**
 * Get current logged in user profile
 * Access: Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        profilePicture: true,
        createdAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { user },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Upload or update user profile picture
 * Access: Private
 */
const uploadProfilePicture = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: 'error',
        message: 'Please upload an image file.',
      });
    }

    const userId = req.user.id;
    const newProfilePicturePath = req.file.path.replace(/\\/g, '/');

    // Find the user to check for existing profile picture
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    // If user already has a profile picture, delete the old one from file system
    if (user && user.profilePicture) {
      const oldPath = path.join(__dirname, '../../', user.profilePicture);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
    }

    // Update the database with new picture path
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { profilePicture: newProfilePicturePath },
      select: {
        id: true,
        name: true,
        profilePicture: true,
      },
    });

    res.status(200).json({
      status: 'success',
      message: 'Profile picture uploaded successfully.',
      data: { user: updatedUser },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getProfile,
  uploadProfilePicture,
};
