const express = require('express');
const router = express.Router();

const authController = require('../controllers/auth.controller');
const validate = require('../middlewares/validate.middleware');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

// Register a new member
// Route: POST /api/auth/register
router.post('/register', validate(registerSchema), authController.register);

// Login to an account
// Route: POST /api/auth/login
router.post('/login', validate(loginSchema), authController.login);

module.exports = router;
