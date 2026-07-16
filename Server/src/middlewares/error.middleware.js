import ApiError from '../utils/ApiError.js';
import logger from '../config/logger.js';

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  logger.error(`${err.message}`, { stack: err.stack });

  // Prisma errors
  if (err.code === 'P2002') {
    error = new ApiError(409, 'Duplicate field value entered');
  }

  if (err.name === 'JsonWebTokenError') {
    error = new ApiError(401, 'Invalid token');
  }

  if (err.name === 'TokenExpiredError') {
    error = new ApiError(401, 'Token expired');
  }

  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Server Error',
    errors: error.errors || [],
  });
};

export default errorHandler;
