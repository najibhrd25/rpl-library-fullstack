const { z } = require('zod');

// Schema for borrowing a book
const borrowSchema = z.object({
  body: z.object({
    bookId: z
      .number({
        required_error: 'bookId is required',
        invalid_type_error: 'bookId must be a number',
      })
      .positive('bookId must be a positive integer')
      .int('bookId must be an integer'),
  }),
});

module.exports = {
  borrowSchema,
};
