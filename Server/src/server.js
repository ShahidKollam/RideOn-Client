import app from './app.js'
import { config } from './config/env.js'
import logger from './config/logger.js'

const PORT = config.port

const server = app.listen(PORT, () => {
    logger.info(`\n<> Server running on port ${PORT} in ${config.nodeEnv} mode`)
})

process.on('unhandledRejection', (err) => {
    logger.error('UNHANDLED REJECTION! 💥 Shutting down...')
    logger.error(err)
    server.close(() => {
        process.exit(1)
    })
})
