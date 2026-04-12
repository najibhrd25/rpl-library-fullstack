const { z } = require('zod');

/**
 * Validator schema for user registration.
 */
const registerSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }).min(3, 'Name must be at least 3 characters long'),
    email: z.string({
      required_error: 'Email is required',
    }).email('Not a valid email format'),
    password: z.string({
      required_error: 'Password is required',
    }).min(6, 'Password must be at least 6 characters long'),
  }),
});

/**
 * Validator schema for user login.
 */
const loginSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }).email('Not a valid email format'),
    password: z.string({
      required_error: 'Password is required',
    }),
  }),
});

module.exports = {
  registerSchema,
  loginSchema,
};
