import ApiError from '../utils/ApiError.js'
import logger from '../config/logger.js'
import { config } from '../config/env.js'

const errorHandler = (err, req, res, next) => {
    let error = err

    // Log full error server-side only
    logger.error(
        {
            err: {
                message: err.message,
                stack: err.stack,
                code: err.code,
                name: err.name,
            },
            path: req.originalUrl,
            method: req.method,
        },
        err.message || 'Unhandled error'
    )

    // Prisma unique constraint
    if (err.code === 'P2002') {
        error = new ApiError(409, 'Duplicate field value entered')
    }

    // Prisma record not found
    if (err.code === 'P2025') {
        error = new ApiError(404, 'Resource not found')
    }

    if (err.name === 'JsonWebTokenError') {
        error = new ApiError(401, 'Invalid token')
    }

    if (err.name === 'TokenExpiredError') {
        error = new ApiError(401, 'Token expired')
    }

    // CORS errors from cors middleware
    if (err.message === 'Not allowed by CORS') {
        error = new ApiError(403, 'Not allowed by CORS')
    }

    const statusCode = error.statusCode || 500
    const isOperational = error instanceof ApiError

    // Never leak internal details to clients in production
    const message =
        statusCode === 500 && config.nodeEnv === 'production' && !isOperational
            ? 'Internal server error'
            : error.message || 'Server Error'

    res.status(statusCode).json({
        success: false,
        message,
        errors: error.errors || [],
        ...(config.nodeEnv === 'development' && statusCode === 500 && !isOperational
            ? { stack: err.stack }
            : {}),
    })
}

export default errorHandler
