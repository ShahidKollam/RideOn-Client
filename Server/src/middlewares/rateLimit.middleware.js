/**
 * Lightweight in-memory rate limiter (no external dependency).
 * Suitable for single-instance deployments. For multi-instance, use Redis-backed limiter.
 *
 * Does not change response shape on success — only blocks excessive traffic.
 */

const buckets = new Map()

const cleanupInterval = setInterval(() => {
    const now = Date.now()
    for (const [key, entry] of buckets.entries()) {
        if (entry.resetAt <= now) buckets.delete(key)
    }
}, 60_000)
// Allow process to exit even if interval is active (Node)
if (cleanupInterval.unref) cleanupInterval.unref()

/**
 * @param {object} options
 * @param {number} options.windowMs - window length in ms
 * @param {number} options.max - max requests per window per key
 * @param {function} [options.keyGenerator] - (req) => string
 * @param {string} [options.message]
 */
export const rateLimit = ({
    windowMs = 15 * 60 * 1000,
    max = 100,
    keyGenerator = (req) => req.ip || req.headers['x-forwarded-for'] || 'unknown',
    message = 'Too many requests, please try again later',
} = {}) => {
    return (req, res, next) => {
        try {
            const key = String(keyGenerator(req))
            const now = Date.now()
            let entry = buckets.get(key)

            if (!entry || entry.resetAt <= now) {
                entry = { count: 0, resetAt: now + windowMs }
                buckets.set(key, entry)
            }

            entry.count += 1

            res.setHeader('X-RateLimit-Limit', String(max))
            res.setHeader('X-RateLimit-Remaining', String(Math.max(0, max - entry.count)))
            res.setHeader('X-RateLimit-Reset', String(Math.ceil(entry.resetAt / 1000)))

            if (entry.count > max) {
                return res.status(429).json({
                    success: false,
                    message,
                    errors: [],
                })
            }

            next()
        } catch {
            // Fail open on limiter errors so business flows are not blocked
            next()
        }
    }
}

/** Stricter limiter for auth / magic-link endpoints */
export const authRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 20,
    message: 'Too many authentication attempts. Please try again in a few minutes.',
})

/** Limiter for payment creation */
export const paymentRateLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    message: 'Too many payment requests. Please try again later.',
})

export default rateLimit
