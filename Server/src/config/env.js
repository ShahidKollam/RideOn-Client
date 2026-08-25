import dotenv from 'dotenv'
dotenv.config()

export const config = {
    port: process.env.PORT || 3000,
    nodeEnv: process.env.NODE_ENV || 'development',

    jwtSecret: process.env.JWT_SECRET,
    jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,

    jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshTokenExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',

    databaseUrl: process.env.DATABASE_URL,

    brevoApiKey: process.env.BREVO_API_KEY,
    mailFromName: process.env.MAIL_FROM_NAME,
    mailFromEmail: process.env.MAIL_FROM_EMAIL,

    clientUrl: process.env.CLIENT_URL_FE, 
    adminUrl: process.env.ADMIN_URL_FE,
}

if (!config.jwtSecret || !config.jwtRefreshSecret || !config.databaseUrl) {
    throw new Error('Missing required environment variables')
}
