import pino from 'pino'

const logger =
    process.env.NODE_ENV === 'production'
        ? pino({
              level: 'info',
          })
        : pino({
              level: 'debug',
              transport: {
                  target: 'pino-pretty',
                  options: {
                      colorize: true,
                      singleLine: true,
                      translateTime: 'HH:MM:ss',
                      ignore: 'pid,hostname,req,res',
                  },
              },
          })

export default logger
