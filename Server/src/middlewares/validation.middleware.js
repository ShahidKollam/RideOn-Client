import ApiError from '../utils/ApiError.js'

export const validate = (schema) => {
    return (req, res, next) => {
        try {
            const result = schema.safeParse(req.body)
            if (!result.success) {
                const errors = result.error.errors.map((err) => ({
                    field: err.path.join('.'),
                    message: err.message,
                }))
                throw new ApiError(400, 'Validation failed', errors)
            }
            req.body = result.data
            next()
        } catch (error) {
            next(error)
        }
    }
}
