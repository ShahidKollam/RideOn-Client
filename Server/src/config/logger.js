import pino from 'pino'

// const logger = pino({
//     level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
//     transport: {
//         target: 'pino-pretty',
//         options: {
//             colorize: true,
//         },
//     },
// })

const logger = pino({
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      singleLine: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname,req,res',
    },
  },
});

export default logger
