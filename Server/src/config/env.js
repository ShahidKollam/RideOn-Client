import dotenv from 'dotenv';
dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || 'development',
  jwtSecret: process.env.JWT_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  databaseUrl: process.env.DATABASE_URL,

  mailHost: process.env.MAIL_HOST,
  mailPort: parseInt(process.env.MAIL_PORT),
  mailUser: process.env.MAIL_USER,
  mailPass: process.env.MAIL_PASS,
  mailFrom: process.env.MAIL_FROM,
  
  frontendUrl: process.env.FRONTEND_URL,
};

if (!config.jwtSecret || !config.jwtRefreshSecret || !config.databaseUrl) {
  throw new Error('Missing required environment variables');
}
