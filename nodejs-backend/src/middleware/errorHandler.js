/**
 * Global error handling middleware
 * Catches all errors and returns consistent error responses
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error occurred:', {
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  // Default error response
  let statusCode = 500;
  let errorResponse = {
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred',
    },
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorResponse.error = {
      code: 'VALIDATION_ERROR',
      message: err.message,
    };
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorResponse.error = {
      code: 'INVALID_TOKEN',
      message: 'Invalid authentication token',
    };
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorResponse.error = {
      code: 'TOKEN_EXPIRED',
      message: 'Authentication token has expired',
    };
  } else if (err.code === 'P2002') {
    // Prisma unique constraint violation
    statusCode = 409;
    errorResponse.error = {
      code: 'DUPLICATE_ENTRY',
      message: 'A record with this information already exists',
      details: err.meta,
    };
  } else if (err.code === 'P2025') {
    // Prisma record not found
    statusCode = 404;
    errorResponse.error = {
      code: 'NOT_FOUND',
      message: 'Record not found',
    };
  } else if (err.statusCode || err.status) {
    // Custom error with status code
    statusCode = err.statusCode || err.status;
    errorResponse.error = {
      code: err.code || 'CUSTOM_ERROR',
      message: err.message,
      details: err.details,
    };
  }

  // Don't expose internal errors in production
  if (process.env.NODE_ENV === 'production' && statusCode === 500) {
    errorResponse.error.message = 'Internal server error';
    delete errorResponse.error.details;
  }

  res.status(statusCode).json(errorResponse);
};

/**
 * Async error wrapper
 * Wraps async route handlers to catch errors
 */
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'APP_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.name = 'AppError';
  }
}