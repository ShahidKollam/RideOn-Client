import ApiError from '../utils/ApiError.js'
import { verifyToken } from '../lib/jwt.js'
import prisma from '../config/prisma.js'

/**
 * Authenticate admin JWT and attach admin + permissions to req.
 */
export const authenticateAdmin = async (req, res, next) => {
    try {
        let token
        if (req.headers.authorization?.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1]
        }
        if (!token) throw new ApiError(401, 'Not authorized')

        const decoded = verifyToken(token)
        if (decoded.role !== 'admin') throw new ApiError(401, 'Not authorized')

        const admin = await prisma.admin.findUnique({
            where: { id: decoded.id },
            select: {
                id: true,
                name: true,
                email: true,
                isActive: true,
                campusId: true,
                roleId: true,
                role: {
                    select: {
                        id: true,
                        name: true,
                        isActive: true,
                        permissions: {
                            select: { permission: { select: { name: true } } },
                        },
                    },
                },
            },
        })

        if (!admin) throw new ApiError(401, 'Admin not found')
        if (!admin.isActive) throw new ApiError(403, 'Admin account is inactive')
        if (!admin.role || !admin.role.isActive) {
            throw new ApiError(403, 'Admin role is inactive')
        }

        const permissions = (admin.role.permissions || []).map((rp) => rp.permission.name)

        req.admin = {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            campusId: admin.campusId,
            roleId: admin.roleId,
            roleName: admin.role.name,
            permissions,
        }
        next()
    } catch (error) {
        if (error instanceof ApiError) return next(error)
        next(new ApiError(401, 'Not authorized'))
    }
}

export default authenticateAdmin
