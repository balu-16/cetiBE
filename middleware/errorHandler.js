// Global error handling middleware
export const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err);

  // Default error
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // Specific error types
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = 'Validation Error: ' + err.message;
  } else if (err.name === 'UnauthorizedError') {
    error.status = 401;
    error.message = 'Unauthorized access';
  } else if (err.code === 'ENOTFOUND') {
    error.status = 503;
    error.message = 'Service temporarily unavailable';
  }

  // Don't leak error details in production
  if (process.env.NODE_ENV === 'production') {
    delete error.stack;
  }

  res.status(error.status).json({
    success: false,
    error: error.message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

// 404 handler
export const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: `Route ${req.originalUrl} not found`
  });
};

// Async error wrapper
export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};