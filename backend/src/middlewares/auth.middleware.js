const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const config = require('../config/env');

/**
 * Authentication Middleware
 * Validates the JWT Bearer token and attaches the user to the request.
 */
const auth = async (req, res, next) => {
  try {
    // 1) Checking if the token is present in the headers
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'error',
        message: 'You are not logged in. Please log in to get access.',
      });
    }

    // 2) Verify token
    const decoded = jwt.verify(token, config.jwtSecret);

    // 3) Check if user still exists (in case user was deleted but token is still active)
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.id },
    });

    if (!currentUser) {
      return res.status(401).json({
        status: 'error',
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Grant access to protected route by attaching user to the req object
    req.user = currentUser;
    next();
  } catch (err) {
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({ status: 'error', message: 'Invalid token. Please log in again.' });
    }
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ status: 'error', message: 'Your token has expired. Please log in again.' });
    }
    
    res.status(500).json({
      status: 'error',
      message: 'Authentication failed.',
    });
  }
};

/**
 * Admin Role Authorization Middleware
 * Must be used AFTER the `auth` middleware.
 */
const isAdmin = (req, res, next) => {
  // `req.user` refers to the user object attached from the previous `auth` middleware
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({
      status: 'error',
      message: 'Forbidden area. You must be an ADMIN to perform this action.',
    });
  }
};

module.exports = { auth, isAdmin };
