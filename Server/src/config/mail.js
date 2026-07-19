// import nodemailer from 'nodemailer';
// import { config } from './env.js';

// const transporter = nodemailer.createTransport({
//   host: config.mailHost,
//   port: config.mailPort,
//   secure: false,
//   auth: {
//     user: config.mailUser,
//     pass: config.mailPass,
//   },
// });

// export default transporter;
import nodemailer from 'nodemailer'
import { config } from './env.js'

const transporter = nodemailer.createTransport({
    host: config.mailHost,
    port: Number(config.mailPort),
    secure: false, // Port 587
    auth: {
        user: config.mailUser,
        pass: config.mailPass,
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 10000,

    logger: true,
    debug: true,
})

export default transporter
