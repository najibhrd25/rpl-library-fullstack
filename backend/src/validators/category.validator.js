const { z } = require('zod');

// Schema for creating or updating a category
const categorySchema = z.object({
  body: z.object({
    name: z
      .string({
        required_error: 'Category name is required',
        invalid_type_error: 'Category name must be a string',
      })
      .min(2, 'Category name must be at least 2 characters long')
      .max(100, 'Category name must be less than 100 characters'),
  }),
});

module.exports = {
  categorySchema,
};
