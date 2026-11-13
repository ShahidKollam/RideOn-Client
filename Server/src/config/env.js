import dotenv from 'dotenv'

dotenv.config()

const PLACEHOLDER_SECRETS = new Set([
    'your_jwt_secret_key_here',
    'your_jwt_refresh_secret_key_here',
    'changeme',
    'secret',
    'jwt_secret',
])

function isWeakSecret(value) {
    if (!value || typeof value !== 'string') return true
    const v = value.trim()
    if (v.length < 32) return true
    if (PLACEHOLDER_SECRETS.has(v.toLowerCase())) return true
    return false
}

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
    clientUrl: process.env.CLIENT_URL_FE || 'http://localhost:5173',
    adminUrl: process.env.ADMIN_URL_FE || 'http://localhost:5174',

    corsOrigins: process.env.CORS_ORIGINS
        ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
        : [],
}

if (!config.jwtSecret || !config.jwtRefreshSecret || !config.databaseUrl) {
    throw new Error('Missing required environment variables: JWT_SECRET, JWT_REFRESH_SECRET, DATABASE_URL')
}

if (isWeakSecret(config.jwtSecret) || isWeakSecret(config.jwtRefreshSecret)) {
    if (config.nodeEnv === 'production') {
        throw new Error(
            'JWT_SECRET and JWT_REFRESH_SECRET must be strong random values (min 32 chars) in production. Do not use placeholder values.'
        )
    }
    console.warn(
        '⚠️  WARNING: JWT secrets look weak or are placeholders. Generate strong secrets before production deployment.'
    )
}

if (config.nodeEnv === 'production' && config.corsOrigins.length === 0) {
    console.warn('⚠️  WARNING: CORS_ORIGINS is empty in production.')
}
