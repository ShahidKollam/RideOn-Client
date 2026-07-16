import nodemailer from 'nodemailer';
import { config } from './env.js';

const transporter = nodemailer.createTransport({
  host: config.mailHost,
  port: config.mailPort,
  secure: false,
  auth: {
    user: config.mailUser,
    pass: config.mailPass,
  },
});

export default transporter;
