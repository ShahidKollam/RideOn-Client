import ApiError from '../utils/ApiError.js'
import { verifyToken } from '../lib/jwt.js'
import prisma from '../config/prisma.js'

export const protect = async (req, res, next) => {
    try {
        let token
        if (req.headers.authorization?.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) throw new ApiError(401, 'Not authorized')

        const decoded = verifyToken(token)

        if (decoded.role !== 'user') {
            throw new ApiError(401, 'Not authorized')
        }

        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, onboardingStatus: true, email: true, name: true },
        })

        if (!user) throw new ApiError(401, 'User not found')

        req.user = user
        next()
    } catch (error) {
        next(new ApiError(401, 'Not authorized'))
    }
}

export const protectAdmin = async (req, res, next) => {
    try {
        let token
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1]
        }

        if (!token) {
            throw new ApiError(401, 'Not authorized')
        }

        const decoded = verifyToken(token)

        if (decoded.role !== 'admin') {
            throw new ApiError(401, 'Not authorized')
        }

        const admin = await prisma.admin.findUnique({ where: { id: decoded.id } })

        if (!admin) {
            throw new ApiError(401, 'Admin not found')
        }

        req.admin = admin
        next()
    } catch (error) {
        next(new ApiError(401, 'Not authorized'))
    }
}
