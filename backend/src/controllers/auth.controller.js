const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../utils/prisma');
const config = require('../config/env');

/**
 * Register a new user (Member)
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    // Check if the user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is already registered.',
      });
    }

    // Hash the password securely utilizing bcryptjs (Mac friendly)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new user (default role is MEMBER based on Prisma schema)
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      }, // Exclude exposing the password on response
    });

    res.status(201).json({
      status: 'success',
      message: 'Account created successfully',
      data: { user: newUser },
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Loign to an existing account
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    // Retrieve user by email
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    // Ensure password matches
    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.id, role: user.role },
      config.jwtSecret,
      { expiresIn: '1d' } // Token expires in 1 day
    );

    res.status(200).json({
      status: 'success',
      message: 'Logged in successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  register,
  login,
};
