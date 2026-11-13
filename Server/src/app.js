import express from 'express'
import helmet from 'helmet'
import compression from 'compression'
import cookieParser from 'cookie-parser'
import cors from 'cors'
import pinoHttp from 'pino-http'

import logger from './config/logger.js'
import { config } from './config/env.js'
import routes from './api/routes.js'
import errorHandler from './middlewares/error.middleware.js'
import notFound from './middlewares/notFound.middleware.js'

import cron from 'node-cron'
import { reconcilePaidPaymentsWithoutBooking } from './modules/payment/payment.service.js'

const app = express()

// Security headers (tighten defaults without breaking SPA clients)
app.use(
    helmet({
        contentSecurityPolicy: false, // SPA + external assets; enable at reverse-proxy if needed
        crossOriginEmbedderPolicy: false,
        crossOriginResourcePolicy: { policy: 'cross-origin' },
        referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
        hsts: config.nodeEnv === 'production' ? { maxAge: 31536000, includeSubDomains: true } : false,
    })
)
app.use(compression())

const allowedOrigins = config.corsOrigins

if (config.nodeEnv === 'development') {
    console.log('Allowed origins for CORS:', allowedOrigins)
}

app.use(
    cors({
        origin: (origin, callback) => {
            // Allow non-browser clients (mobile apps, server-to-server, health checks)
            if (!origin) {
                return callback(null, true)
            }

            if (allowedOrigins.includes(origin)) {
                return callback(null, true)
            }

            if (config.nodeEnv === 'development') {
                console.log('❌ CORS blocked:', origin)
            }

            return callback(new Error('Not allowed by CORS'))
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        maxAge: 86400,
    })
)

app.use(cookieParser())

// Structured request logging (avoid noisy console in production)
app.use(
    pinoHttp({
        logger,
        autoLogging: config.nodeEnv !== 'test',
        quietReqLogger: true,
    })
)

if (config.nodeEnv === 'development') {
    app.use((req, res, next) => {
        console.log(`${req.method} ${req.originalUrl}`)
        next()
    })
}

/**
 * Razorpay webhook MUST receive the exact raw body for HMAC verification.
 * Mount raw parser only for this path before the global JSON parser.
 */
app.use(
    '/api/v1/payments/webhook',
    express.raw({ type: 'application/json', limit: '256kb' }),
    (req, res, next) => {
        if (Buffer.isBuffer(req.body)) {
            req.rawBody = req.body.toString('utf8')
            try {
                req.body = JSON.parse(req.rawBody)
            } catch {
                req.body = {}
            }
        }
        next()
    }
)

// Body parsers with size limits (DoS mitigation)
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }))

// Routes
app.use('/api/v1', routes)

// Health check (no auth, minimal surface)
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

if (config.nodeEnv !== 'development' && config.nodeEnv !== 'test') {
    cron.schedule('*/2 * * * *', async () => {
        try {
            logger.info('Running payment reconciliation')
            await reconcilePaidPaymentsWithoutBooking()
        } catch (err) {
            logger.error({ err }, 'Payment reconciliation failed')
        }
    })
}

// Error handling
app.use(notFound)
app.use(errorHandler)

export default app
