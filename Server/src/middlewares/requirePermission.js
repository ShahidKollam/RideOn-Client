import ApiError from '../utils/ApiError.js'

/**
 * Require one or more permissions. SUPER_ADMIN bypasses checks.
 */
export const requirePermission = (...required) => {
  return (req, res, next) => {
    if (!req.admin) return next(new ApiError(401, 'Not authorized'))
    if (req.admin.roleName === 'SUPER_ADMIN') return next()

    const perms = req.admin.permissions || []
    const hasAll = required.every((p) => perms.includes(p))
    if (!hasAll) {
      return next(
        new ApiError(403, `Missing required permission: ${required.join(', ')}`)
      )
    }
    next()
  }
}

export default requirePermission
