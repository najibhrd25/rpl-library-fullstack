const { z } = require('zod');

// Notice: In FormData uploads (Multer), numbers might come as strings, 
// so we use a pre-process or string parsing for stock/categoryId.

const createBookSchema = z.object({
  body: z.object({
    title: z.string({ required_error: 'Title is required' }).min(1),
    author: z.string({ required_error: 'Author is required' }).min(1),
    description: z.string().optional(),
    stock: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val >= 0, {
      message: 'Stock must be a positive number',
    }),
    categoryId: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0, {
      message: 'Category ID must be a valid number',
    }),
  }),
});

const updateBookSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    author: z.string().min(1).optional(),
    description: z.string().optional(),
    stock: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val >= 0, {
      message: 'Stock must be a positive number',
    }).optional(),
    categoryId: z.string().transform((val) => parseInt(val, 10)).refine((val) => !isNaN(val) && val > 0, {
      message: 'Category ID must be a valid number',
    }).optional(),
  }),
});

module.exports = {
  createBookSchema,
  updateBookSchema,
};
