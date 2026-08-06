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
// app.js or server.js

import cron from 'node-cron'
import { reconcilePaidPaymentsWithoutBooking } from './modules/payment/payment.service.js'

const app = express()

// Security middleware
app.use(helmet())
app.use(compression())
app.use(
    cors({
        origin: config.frontendUrl,
        credentials: true,
    })
)
app.use(cookieParser())

// Logging
app.use(pinoHttp({ logger }))

app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'development') {
        console.log(`${req.method} ${req.originalUrl}`)
    }
    console.log(`${req.method} ${req.originalUrl}`)
    next()
})

// Body parser
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Routes
app.use('/api/v1', routes)

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() })
})

cron.schedule('*/2 * * * *', async () => {
    try {
        console.log('🟣 Running payment reconciliation...')
        await reconcilePaidPaymentsWithoutBooking()
    } catch (err) {
        console.error(err)
    }
})

// Error handling
app.use(notFound)
app.use(errorHandler)

export default app
