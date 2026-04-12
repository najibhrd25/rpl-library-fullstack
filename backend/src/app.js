const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

// ==========================================
// 1. GLOBAL MIDDLEWARES
// ==========================================
// Allow Cross-Origin Resource Sharing (CORS)
app.use(cors());

// Parse incoming JSON payloads with a reasonable limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ==========================================
// 2. STATIC FOLDERS
// ==========================================
// Serve uploaded files statically so they can be accessed via URL
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// ==========================================
// 3. ROUTES (Entry Points)
// ==========================================
const authRoutes = require('./routes/auth.routes');
const bookRoutes = require('./routes/book.routes');
const transactionRoutes = require('./routes/transaction.routes');
const categoryRoutes = require('./routes/category.routes');
const userRoutes = require('./routes/user.routes');

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Welcome to the RPLibrary API! 🚀',
  });
});

// Configure API Routes (Supporting both /api prefix and root level for Postman compatibility)
const apiRoutes = [
  { path: '/auth', router: authRoutes },
  { path: '/users', router: userRoutes },
  { path: '/categories', router: categoryRoutes },
  { path: '/books', router: bookRoutes },
  { path: '/transactions', router: transactionRoutes },
];

apiRoutes.forEach((route) => {
  app.use(`/api${route.path}`, route.router); // Support /api/example
  app.use(route.path, route.router);          // Support /example (for Postman compatibility)
});

// ==========================================
// 4. FALLBACK & ERROR HANDLING
// ==========================================

// Handle 404 Not Found
app.use((req, res, next) => {
  res.status(404).json({
    status: 'error',
    message: `Cannot find ${req.method} ${req.originalUrl} on this server.`,
  });
});

// Global Error Handler Middleware
app.use((err, req, res, next) => {
  console.error('[ERROR]', err); // Log the error trace for debugging

  // Formatting error response
  res.status(err.status || 500).json({
    status: 'error',
    message: err.message || 'Internal Server Error',
    // Optional: send stack trace only during development
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

module.exports = app;
