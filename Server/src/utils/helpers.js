import crypto from 'crypto'

export const generateMagicToken = () => {
    return crypto.randomBytes(32).toString('hex')
}

export const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex')
}
