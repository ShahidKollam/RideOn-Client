import prisma from '../../config/prisma.js'
import { generateToken, generateRefreshToken, verifyToken } from '../../lib/jwt.js'
import { sendMagicLink } from '../../lib/mailer.js'
import { generateMagicToken, hashToken } from '../../utils/helpers.js'
import bcrypt from 'bcrypt'
import ApiError from '../../utils/ApiError.js'

export const signup = async (data) => {
    const existingUser = await prisma.user.findUnique({ where: { email: data.email.toLowerCase() } })
    if (existingUser) throw new ApiError(409, 'User already exists')

    const campus = await prisma.campus.findUnique({ where: { id: data.campusId } })
    if (!campus || !campus.isActive) throw new ApiError(400, 'Invalid campus')

    const user = await prisma.user.create({
        data: {
            name: data.name,
            studentId: data.studentId,
            email: data.email.toLowerCase(),
            campusId: data.campusId,
            isVerified: false,
            onboardingStatus: 'SIGNED_UP',
            acceptedTerms: false,
        },
        include: { campus: true },
    })

    // Auto send magic link after signup
    await sendMagicLinkService(data.email)

    return user
}

export const sendMagicLinkService = async (email) => {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    if (!user) {
        throw new ApiError(404, 'No account found with this email. Please sign up first.')
    }
    await prisma.magicLinkToken.deleteMany({
        where: { userId: user.id, usedAt: null },
    })

    const magicToken = generateMagicToken()
    const tokenHash = hashToken(magicToken)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000)

    await prisma.magicLinkToken.create({
        data: { tokenHash, userId: user.id, expiresAt },
    })
    
    console.log('Before sendMail')

    await sendMagicLink(email, magicToken)

    console.log('After sendMail')

    return { message: 'Magic link sent' }
}

export const verifyMagicLinkService = async (token) => {
    const tokenHash = hashToken(token)
    const magicLinkToken = await prisma.magicLinkToken.findUnique({
        where: { tokenHash },
        include: { user: { include: { campus: true } } },
    })

    if (!magicLinkToken) throw new ApiError(400, 'Invalid magic link')
    if (magicLinkToken.expiresAt < new Date()) {
        await prisma.magicLinkToken.delete({ where: { id: magicLinkToken.id } })
        throw new ApiError(400, 'Magic link expired')
    }
    if (magicLinkToken.usedAt) throw new ApiError(400, 'Magic link used')

    return await prisma.$transaction(async (tx) => {
        await tx.magicLinkToken.update({
            where: { id: magicLinkToken.id },
            data: { usedAt: new Date() },
        })

        const updates = { isVerified: true }
        if (magicLinkToken.user.onboardingStatus === 'SIGNED_UP') {
            updates.onboardingStatus = 'EMAIL_VERIFIED'
        }

        const user = await tx.user.update({
            where: { id: magicLinkToken.userId },
            data: updates,
            include: { campus: true },
        })

        const accessToken = generateToken({ id: user.id, role: 'user' })
        const refreshToken = generateRefreshToken({ id: user.id })

        await tx.refreshToken.create({
            data: {
                token: refreshToken,
                userId: user.id,
                expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            },
        })

        return { accessToken, refreshToken, user }
    })
}

export const completeProfile = async (userId, data) => {
    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new ApiError(404, 'User not found')
    if (user.onboardingStatus === 'PROFILE_COMPLETED') throw new ApiError(400, 'Profile already completed')

    const existingLicense = await prisma.user.findUnique({
        where: { drivingLicenseNumber: data.drivingLicenseNumber },
    })
    if (existingLicense) throw new ApiError(400, 'Driving license number already exists')

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            phone: data.phone,
            hostel: data.hostel,
            department: data.department,
            yearOfStudy: data.yearOfStudy,
            drivingLicenseNumber: data.drivingLicenseNumber,
            acceptedTerms: true,
            acceptedTermsAt: new Date(),
            onboardingStatus: 'PROFILE_COMPLETED',
        },
        include: { campus: true },
    })

    return updatedUser
}

// ... (refreshTokenService, adminLogin, logout, logoutAll remain same as previous version)
export const refreshTokenService = async (refreshToken) => {
    let decoded
    try {
        decoded = verifyToken(refreshToken, process.env.JWT_REFRESH_SECRET)
    } catch (error) {
        await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
        throw new ApiError(401, 'Invalid refresh token')
    }

    const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
    })

    if (!storedToken) throw new ApiError(401, 'Refresh token invalid')

    if (storedToken.expiresAt < new Date()) {
        await prisma.refreshToken.delete({ where: { token: refreshToken } })
        throw new ApiError(401, 'Refresh token has expired')
    }

    if (storedToken.userId !== decoded.id) {
        await prisma.refreshToken.delete({ where: { token: refreshToken } })
        throw new ApiError(401, 'Invalid refresh token')
    }

    // const user = await prisma.user.findUnique({ where: { id: decoded.id } })
    const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        include: { campus: true },
    })

    if (!user) throw new ApiError(401, 'User not found')

    const newAccessToken = generateToken({ id: user.id, role: 'user' })
    const newRefreshToken = generateRefreshToken({ id: user.id })
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)

    await prisma.$transaction(async (tx) => {
        await tx.refreshToken.delete({ where: { token: refreshToken } })
        await tx.refreshToken.create({
            data: {
                token: newRefreshToken,
                userId: user.id,
                expiresAt: newExpiresAt,
            },
        })
    })

    return { accessToken: newAccessToken, refreshToken: newRefreshToken, user }
}

export const adminLogin = async (email, password) => {
    const admin = await prisma.admin.findUnique({ where: { email: email.toLowerCase() } })
    if (!admin || !(await bcrypt.compare(password, admin.password))) {
        throw new ApiError(401, 'Invalid credentials')
    }
    const accessToken = generateToken({ id: admin.id, role: 'admin' })
    return { accessToken, admin }
}

export const logout = async (refreshToken) => {
    await prisma.refreshToken.deleteMany({ where: { token: refreshToken } })
}

export const logoutAll = async (userId) => {
    await prisma.refreshToken.deleteMany({ where: { userId } })
}
